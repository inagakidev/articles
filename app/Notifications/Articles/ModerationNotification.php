<?php

namespace App\Notifications\Articles;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Base dos avisos da moderação para a autora (RF-327, p6-05): por e-mail,
 * pela fila, só depois que a decisão está gravada. O aviso dentro do site
 * entra com as notificações (fatia 19).
 */
abstract class ModerationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> Segundos de espera antes de cada nova tentativa. */
    public array $backoff = [60, 300];

    public function __construct(
        public readonly string $title,
        public readonly ?string $reason = null,
        public readonly ?string $policyItem = null,
    ) {
        $this->afterCommit();
    }

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /** A justificativa e o item da Política, quando a decisão os tem. */
    protected function withDecision(MailMessage $mail): MailMessage
    {
        if ($this->policyItem !== null) {
            $mail->line(__('mail.moderation.policy_item', ['item' => $this->policyItem]));
        }

        if ($this->reason !== null) {
            $mail->line(__('mail.moderation.reason_intro'))->line('“'.$this->reason.'”');
        }

        return $mail;
    }

    protected function policyUrl(): string
    {
        return route('policies.content', ['item' => $this->policyItem]);
    }
}
