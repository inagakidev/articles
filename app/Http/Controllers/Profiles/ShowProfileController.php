<?php

namespace App\Http\Controllers\Profiles;

use App\Http\Controllers\Controller;
use App\Http\Resources\Accounts\PublicProfileResource;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Perfil público em /@username (RF-025, D77). Conta sem e-mail confirmado
 * não tem perfil público: ela ainda pode ser excluída em 7 dias (RF-023).
 * Os artigos entram com a leitura pública (fatia 14, p5-06), que também
 * esconde o perfil em carência ou suspensão.
 */
class ShowProfileController extends Controller
{
    public function __invoke(string $username): Response
    {
        $user = User::query()
            ->where('username', mb_strtolower($username))
            ->whereNotNull('email_verified_at')
            ->firstOrFail();

        return Inertia::render('profile/show', [
            'profile' => new PublicProfileResource($user),
            'articles' => [],
            'articleCount' => 0,
        ]);
    }
}
