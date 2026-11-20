<?php

namespace App\Http\Controllers;

use App\Domain\Accounts\Enums\PolicyType;
use App\Domain\Accounts\Queries\CurrentPolicyVersions;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Termos de uso e Política de privacidade na versão em vigor (D72). O texto
 * vem de resources/policies, no idioma da página, com o português como
 * reserva.
 */
class PolicyController extends Controller
{
    public function __invoke(PolicyType $type, CurrentPolicyVersions $versions): Response
    {
        $version = $versions->of($type);
        $folder = resource_path("policies/{$type->value}");
        $file = collect([app()->getLocale(), 'pt_BR'])
            ->map(fn (string $locale) => "{$folder}/{$version->version}.{$locale}.md")
            ->first(fn (string $path) => is_file($path));

        abort_if($file === null, 404);

        return Inertia::render('policies/show', [
            'type' => $type->value,
            'version' => $version->version,
            'publishedAt' => $version->published_at->toDateString(),
            'draft' => $version->isDraft(),
            // Texto versionado no repositório, revisado em PR: sem conteúdo de usuário.
            'html' => Str::markdown(file_get_contents($file), ['html_input' => 'strip']),
        ]);
    }
}
