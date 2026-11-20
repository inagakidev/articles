<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * E-mail do comando `mail:test`: confere a configuração do provedor (D71).
 * Não usa a fila, para o erro do transporte aparecer na hora.
 */
class MailCheck extends Notification
{
    public function __construct(private string $mailer) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('mail.check.subject'))
            ->line(__('mail.check.body', ['mailer' => $this->mailer, 'time' => now()->toDateTimeString()]));
    }
}
