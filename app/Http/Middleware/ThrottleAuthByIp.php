<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Limite por IP, somado ao limite por e-mail do Fortify: barra quem tenta
 * muitos e-mails diferentes a partir do mesmo endereço (D68, D69).
 */
class ThrottleAuthByIp
{
    /** Rota => [tentativas, janela em segundos]. */
    private const LIMITS = [
        // Entrar: 20 envios por minuto, certos ou errados.
        'login.store' => [20, 60],
        // Pedir link de senha: 10 por hora, para qualquer e-mail.
        'password.email' => [10, 3600],
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $route = $request->route()?->getName();

        if (! $request->isMethod('post') || ! isset(self::LIMITS[$route])) {
            return $next($request);
        }

        [$max, $window] = self::LIMITS[$route];
        $key = "auth-ip:{$route}:{$request->ip()}";

        if (RateLimiter::tooManyAttempts($key, $max)) {
            return $this->tooMany($request, $route, RateLimiter::availableIn($key));
        }

        RateLimiter::hit($key, $window);

        return $next($request);
    }

    private function tooMany(Request $request, string $route, int $seconds): Response
    {
        if ($route === 'login.store') {
            // Mesmo caminho do bloqueio por e-mail: evento de segurança e aviso na tela.
            event(new Lockout($request));

            return back()->with('retryAfter', max(1, $seconds));
        }

        return back()->withErrors([
            'email' => __('account.forgot.too_many', ['minutes' => max(1, (int) ceil($seconds / 60))]),
        ]);
    }
}
