<?php

namespace App\Domain\Accounts\Actions;

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Domain\Accounts\Exceptions\EmailChangeFailed;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Confirma o e-mail novo pelo link (RF-030): ele passa a valer, já
 * confirmado, e a troca entra nos eventos de segurança (RF-024).
 */
class ConfirmEmailChange
{
    public function handle(User $user, Request $request): void
    {
        if (! $user->hasPendingEmail()) {
            throw EmailChangeFailed::expired();
        }

        $email = (string) $user->pending_email;

        if (User::query()->where('email', $email)->whereKeyNot($user->id)->exists()) {
            throw EmailChangeFailed::taken();
        }

        DB::transaction(function () use ($user, $request, $email) {
            $previous = $user->email;

            $user->forceFill([
                'email' => $email,
                'email_verified_at' => now(),
                'pending_email' => null,
                'pending_email_expires_at' => null,
                // Endereço novo volta a receber e-mails (p6-17)
                'email_suppressed_at' => null,
                'email_suppressed_reason' => null,
            ])->save();

            SecurityEvent::create([
                'user_id' => $user->id,
                'type' => SecurityEventType::EmailChanged,
                'email' => $previous,
                'ip_address' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 512, ''),
            ]);
        });
    }
}
