<?php

namespace App\Domain\Accounts\Actions;

use App\Models\User;
use App\Notifications\ConfirmNewEmail;
use App\Notifications\EmailChangeRequested;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

/**
 * Pede a troca do e-mail de uma conta confirmada (RF-030): o novo recebe o
 * link, o atual recebe o aviso, e a conta segue com o e-mail de hoje até a
 * confirmação, em até 24 horas. Um pedido novo substitui o anterior.
 */
class RequestEmailChange
{
    public function handle(User $user, string $email): void
    {
        DB::transaction(function () use ($user, $email) {
            $user->forceFill([
                'pending_email' => $email,
                'pending_email_expires_at' => now()->addHours(User::EMAIL_CHANGE_HOURS),
            ])->save();

            Notification::route('mail', $email)
                ->notify((new ConfirmNewEmail($user))->locale(app()->getLocale()));

            $user->notify((new EmailChangeRequested($email))->locale(app()->getLocale()));
        });
    }
}
