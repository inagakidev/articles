<?php

namespace App\Domain\Accounts\Actions;

use App\Models\User;

/**
 * Troca o username considerado inadequado (RF-178). O antigo fica livre na
 * hora (RF-029), e o endereço antigo do perfil deixa de funcionar.
 */
class ReplaceRequiredUsername
{
    public function handle(User $user, string $username): void
    {
        $user->forceFill([
            'username' => $username,
            'username_change_required_at' => null,
            'username_change_policy_item' => null,
        ])->save();
    }
}
