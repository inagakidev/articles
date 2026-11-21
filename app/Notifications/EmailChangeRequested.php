<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Aviso ao e-mail atual de que alguém pediu a troca (RF-030). Se não foi a
 * pessoa, o e-mail leva a criar uma senha nova, o que encerra as sessões.
 */
class EmailChangeRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [60, 300];

    public function __construct(private string $newEmail)
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
        return (new MailMessage)
            ->subject(__('mail.email_change_requested.subject'))
            ->line(__('mail.email_change_requested.intro', ['email' => $this->newEmail]))
            ->line(__('mail.email_change_requested.not_you'))
            ->action(__('mail.password_changed.action'), route('password.request'));
    }
}
