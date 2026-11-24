<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * O painel administrativo só abre com o 2FA confirmado (RF-017). Sem ele,
 * a administradora vai para a ativação e volta para onde ia depois. Com o
 * 2FA desligado (`auth.admin_two_factor`, D84), deixa passar.
 */
class EnsureTwoFactorConfirmed
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('auth.admin_two_factor') && ! $request->user()?->hasConfirmedTwoFactor()) {
            if ($request->isMethod('GET')) {
                $request->session()->put('url.intended', $request->fullUrl());
            }

            return redirect()->route('admin.two-factor.show');
        }

        return $next($request);
    }
}
