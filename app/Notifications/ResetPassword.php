<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * O e-mail de recuperação de senha do Laravel, enviado pela fila. Quem chama
 * informa o idioma da pessoa, porque o worker não conhece a requisição.
 */
class ResetPassword extends BaseResetPassword implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> Segundos de espera antes de cada nova tentativa. */
    public array $backoff = [60, 300];

    public function __construct(string $token)
    {
        parent::__construct($token);

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
            ->subject(__('mail.reset_password.subject'))
            ->line(__('mail.reset_password.intro'))
            ->action(__('mail.reset_password.action'), $url)
            ->line(__('mail.reset_password.expires', [
                'minutes' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]))
            ->line(__('mail.reset_password.ignore'));
    }
}
