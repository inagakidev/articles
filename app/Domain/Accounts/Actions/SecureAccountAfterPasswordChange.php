<?php

namespace App\Domain\Accounts\Actions;

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Notifications\PasswordChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Depois de uma troca de senha: encerra as sessões abertas em outros
 * aparelhos, registra o evento de segurança e avisa a pessoa por e-mail
 * (RF-024, D69). Serve à recuperação pelo link e, na fatia 6, à troca logada.
 */
class SecureAccountAfterPasswordChange
{
    public function handle(User $user, Request $request, ?string $keepSessionId = null): void
    {
        DB::transaction(function () use ($user, $request, $keepSessionId) {
            // Derruba os "lembrar de mim" de todos os aparelhos.
            $user->setRememberToken(Str::random(60));
            $user->save();

            if (config('session.driver') === 'database') {
                DB::table(config('session.table', 'sessions'))
                    ->where('user_id', $user->id)
                    ->when($keepSessionId, fn ($query) => $query->where('id', '!=', $keepSessionId))
                    ->delete();
            }

            SecurityEvent::create([
                'user_id' => $user->id,
                'type' => SecurityEventType::PasswordChanged,
                'email' => $user->email,
                'ip_address' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 512, ''),
            ]);

            $user->notify((new PasswordChanged)->locale(app()->getLocale()));
        });
    }
}
