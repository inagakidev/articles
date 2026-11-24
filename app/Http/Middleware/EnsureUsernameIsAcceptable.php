<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Username considerado inadequado: a pessoa escolhe outro antes de
 * continuar (RF-178, D91). Ler as políticas, trocar o idioma e sair
 * continuam livres.
 */
class EnsureUsernameIsAcceptable
{
    /** Rotas que funcionam antes da troca. */
    private const ALLOWED = [
        'username.required',
        'username.required.update',
        'username.availability',
        'policies.*',
        'logout',
        'locale.update',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user?->username_change_required_at === null || $request->routeIs(...self::ALLOWED)) {
            return $next($request);
        }

        if ($request->isMethod('get')) {
            redirect()->setIntendedUrl($request->fullUrl());
        }

        return redirect()->route('username.required');
    }
}
