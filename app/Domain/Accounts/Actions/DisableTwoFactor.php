<?php

namespace App\Domain\Accounts\Actions;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;

/**
 * A administradora não desliga o 2FA (RF-017): sem ele, o painel não abre.
 * Se perder o aparelho, o caminho é o admin:reset-2fa no servidor (RF-018).
 */
class DisableTwoFactor extends DisableTwoFactorAuthentication
{
    /** @param  User  $user */
    public function __invoke($user)
    {
        if ($user->is_admin) {
            throw new AuthorizationException;
        }

        parent::__invoke($user);
    }
}
