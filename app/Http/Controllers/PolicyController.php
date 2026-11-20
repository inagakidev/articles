<?php

namespace App\Http\Controllers;

use App\Domain\Accounts\Enums\PolicyType;
use App\Domain\Accounts\Queries\CurrentPolicyVersions;
use App\Domain\Accounts\Queries\PolicyDocument;
use App\Models\PolicyVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Termos de uso, Política de privacidade e Política de conteúdo na versão em
 * vigor, com o histórico de versões (RF-272, D73).
 */
class PolicyController extends Controller
{
    public function __invoke(
        PolicyType $type,
        Request $request,
        CurrentPolicyVersions $versions,
        PolicyDocument $documents,
    ): Response {
        $current = $versions->of($type);

        return Inertia::render('policies/show', [
            'type' => $type->value,
            'version' => $this->version($current),
            'document' => $documents->load($current),
            'history' => array_map(fn (PolicyVersion $version) => [
                ...$this->version($version),
                'changes' => $documents->load($version)['changes'],
            ], $versions->history($type)),
            // Item da Política de conteúdo citado por uma decisão da moderação (RF-107).
            'highlight' => $type === PolicyType::Content ? $request->query('item') : null,
            'privacyEmail' => config('app.contacts.privacy'),
        ]);
    }

    /** @return array{label: string, publishedAt: string, draft: bool} */
    private function version(PolicyVersion $version): array
    {
        return [
            'label' => $version->version,
            'publishedAt' => $version->published_at->toDateString(),
            'draft' => $version->isDraft(),
        ];
    }
}
