<?php

namespace App\Domain\Accounts\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;

/**
 * No MVP, o 2FA é só da administradora (RF-017); para as demais pessoas ele
 * fica para depois (RF-019). Toma o lugar da ação do Fortify, então a rota
 * de ativar recusa com 403 quem não administra.
 */
class EnableTwoFactor extends EnableTwoFactorAuthentication
{
    /** @param  User  $user */
    public function __invoke($user, $force = false)
    {
        Gate::forUser($user)->authorize('access-admin');

        parent::__invoke($user, $force);
    }
}
