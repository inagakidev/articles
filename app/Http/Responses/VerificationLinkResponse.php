<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\EmailVerificationNotificationSentResponse;
use Laravel\Fortify\Contracts\RegisterResponse;

/**
 * Depois do cadastro ou de um reenvio, a tela "Confira seu e-mail" com a
 * espera até poder reenviar o link (D72).
 */
class VerificationLinkResponse implements EmailVerificationNotificationSentResponse, RegisterResponse
{
    /** Segundos entre dois links de confirmação. */
    public const RESEND_AFTER = 60;

    public function toResponse($request): RedirectResponse
    {
        return redirect()
            ->route('verification.notice')
            ->with('resendAfter', self::RESEND_AFTER);
    }
}
