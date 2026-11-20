<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\VerifyEmailResponse;

/** Depois de confirmar o e-mail, a tela "E-mail confirmado". */
class EmailVerifiedResponse implements VerifyEmailResponse
{
    public function toResponse($request): RedirectResponse
    {
        return redirect()->route('verification.confirmed');
    }
}
