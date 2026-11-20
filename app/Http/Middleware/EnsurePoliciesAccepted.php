<?php

namespace App\Http\Middleware;

use App\Domain\Accounts\Queries\CurrentPolicyVersions;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Com uma versão nova dos Termos ou da Privacidade, a pessoa aceita antes de
 * continuar usando a conta (RF-013). Ler as políticas, trocar o idioma e
 * sair continuam livres.
 */
class EnsurePoliciesAccepted
{
    /** Rotas que funcionam antes do novo aceite. */
    private const ALLOWED = [
        'policies.*',
        'logout',
        'locale.update',
    ];

    public function __construct(private CurrentPolicyVersions $versions) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || $request->routeIs(...self::ALLOWED)) {
            return $next($request);
        }

        if ($this->versions->pendingFor($user) === []) {
            return $next($request);
        }

        if ($request->isMethod('get')) {
            redirect()->setIntendedUrl($request->fullUrl());
        }

        return redirect()->route('policies.acceptance.show');
    }
}
