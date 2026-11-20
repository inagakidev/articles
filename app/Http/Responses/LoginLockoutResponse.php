<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LockoutResponse;
use Laravel\Fortify\LoginRateLimiter;

/**
 * Volta para a tela de entrar com os segundos que faltam, para a tela mostrar
 * o aviso de pausa e liberar o botão sozinha quando o prazo acabar.
 */
class LoginLockoutResponse implements LockoutResponse
{
    public function __construct(private LoginRateLimiter $limiter) {}

    public function toResponse($request): RedirectResponse
    {
        return back()->with('retryAfter', max(1, $this->limiter->availableIn($request)));
    }
}
