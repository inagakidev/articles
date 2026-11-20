<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\FailedPasswordResetLinkRequestResponse;
use Laravel\Fortify\Contracts\SuccessfulPasswordResetLinkRequestResponse;
use Laravel\Fortify\Fortify;

/**
 * A mesma resposta para e-mail com conta, sem conta ou pedido repetido cedo
 * demais: a tela "Link enviado" nunca revela quem tem conta (D69).
 */
class PasswordResetLinkResponse implements FailedPasswordResetLinkRequestResponse, SuccessfulPasswordResetLinkRequestResponse
{
    public function toResponse($request): RedirectResponse
    {
        return back()
            ->with('sentTo', (string) $request->input(Fortify::email()))
            // Espera do broker entre dois links para o mesmo e-mail.
            ->with('resendAfter', (int) config('auth.passwords.users.throttle'));
    }
}
