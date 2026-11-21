<?php

namespace App\Domain\Accounts\Actions;

use App\Domain\Accounts\Exceptions\CannotMakeAdministrator;
use App\Models\User;

/**
 * Torna uma conta confirmada a administradora da instalação (RF-244, D56).
 * Só existe uma no MVP; o painel ainda vai pedir o 2FA no primeiro acesso.
 */
class MakeAdministrator
{
    public function handle(User $user): void
    {
        $current = User::query()->where('is_admin', true)->whereKeyNot($user->id)->first();

        if ($current !== null) {
            throw CannotMakeAdministrator::alreadyExists($current);
        }

        if ($user->email_verified_at === null) {
            throw CannotMakeAdministrator::unverified($user);
        }

        $user->forceFill(['is_admin' => true])->save();
    }
}
