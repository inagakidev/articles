<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse;
use Laravel\Fortify\Fortify;

/**
 * Depois do login (com ou sem o código do 2FA), volta para onde a pessoa
 * ia. Sem destino, a administradora vai para o painel (D75) e as demais
 * pessoas para o início de sempre. O login também vale como senha
 * confirmada pelo tempo de sempre (`auth.password_timeout`).
 */
class LoginResponse implements LoginResponseContract, TwoFactorLoginResponse
{
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        // A senha acabou de ser digitada: áreas que pedem a confirmação (como
        // a ativação do 2FA) não a pedem de novo logo depois do login.
        $request->session()->passwordConfirmed();

        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $home = $request->user()?->is_admin
            ? route('admin.dashboard', absolute: false)
            : Fortify::redirects('login');

        return redirect()->intended($home);
    }
}
