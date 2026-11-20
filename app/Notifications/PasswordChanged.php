<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Aviso de que a senha foi trocada (p3-06). Se não foi a pessoa, o e-mail
 * leva direto ao pedido de um novo link.
 */
class PasswordChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> Segundos de espera antes de cada nova tentativa. */
    public array $backoff = [60, 300];

    public function __construct()
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
            ->subject(__('mail.password_changed.subject'))
            ->line(__('mail.password_changed.intro'))
            ->line(__('mail.password_changed.not_you'))
            ->action(__('mail.password_changed.action'), route('password.request'));
    }
}
