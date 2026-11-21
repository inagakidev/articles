<?php

namespace App\Domain\Accounts\Actions;

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Último recurso quando a administradora perde o aparelho e os códigos de
 * recuperação (RF-018): apaga o 2FA, encerra as sessões abertas e registra
 * o evento. No próximo acesso ao painel, ela ativa o 2FA de novo.
 */
class ResetAdministratorTwoFactor
{
    public function handle(User $user): void
    {
        DB::transaction(function () use ($user) {
            $user->forceFill([
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
            ])->setRememberToken(Str::random(60));
            $user->save();

            if (config('session.driver') === 'database') {
                DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
            }

            SecurityEvent::create([
                'user_id' => $user->id,
                'type' => SecurityEventType::TwoFactorReset,
                'email' => $user->email,
            ]);
        });
    }
}
