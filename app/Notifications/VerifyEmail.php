<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * O e-mail de verificação do Laravel, enviado pela fila. Quem chama informa o
 * idioma da pessoa, porque o worker não conhece a requisição que pediu o envio.
 */
class VerifyEmail extends BaseVerifyEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> Segundos de espera antes de cada nova tentativa. */
    public array $backoff = [60, 300];

    public function __construct()
    {
        $this->afterCommit();
    }

    /**
     * Textos de lang/, no idioma guardado na notificação.
     *
     * @param  string  $url
     */
    protected function buildMailMessage($url): MailMessage
    {
        return (new MailMessage)
            ->subject(__('mail.verify_email.subject'))
            ->line(__('mail.verify_email.intro', ['app' => config('app.name')]))
            ->action(__('mail.verify_email.action'), $url)
            ->line(__('mail.verify_email.expires', [
                'minutes' => config('auth.verification.expire', 60),
                'days' => User::VERIFICATION_DAYS,
            ]))
            ->line(__('mail.verify_email.ignore'));
    }
}
