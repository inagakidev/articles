<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

/**
 * Link para confirmar o e-mail novo (RF-030), enviado ao endereço novo. O
 * link leva o hash desse endereço: se a troca for cancelada ou trocada por
 * outra, ele deixa de valer.
 */
class ConfirmNewEmail extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300];

    public function __construct(private User $user)
    {
        $this->afterCommit();
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = URL::temporarySignedRoute(
            'settings.email.confirm',
            $this->user->pending_email_expires_at ?? now()->addHours(User::EMAIL_CHANGE_HOURS),
            ['user' => $this->user->id, 'hash' => sha1((string) $this->user->pending_email)],
        );

        return (new MailMessage)
            ->subject(__('mail.confirm_new_email.subject'))
            ->line(__('mail.confirm_new_email.intro', ['username' => $this->user->username]))
            ->action(__('mail.confirm_new_email.action'), $url)
            ->line(__('mail.confirm_new_email.expires', ['hours' => User::EMAIL_CHANGE_HOURS]))
            ->line(__('mail.confirm_new_email.ignore'));
    }
}
