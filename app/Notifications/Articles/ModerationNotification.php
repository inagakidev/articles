<?php

namespace App\Notifications\Articles;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Base dos avisos da moderação para a autora (RF-179 a RF-182, RF-327):
 * por e-mail e dentro do site (D90), pela fila, só depois que a decisão
 * está gravada.
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
        return ['mail', 'database'];
    }

    /** O tipo da notificação no site (`article.approved`…). */
    abstract public function databaseType(object $notifiable): string;

    /** Para onde o aviso no site leva. */
    abstract protected function target(): string;

    /**
     * O aviso no site: só o que o texto precisa, montado no idioma de quem
     * lê. A justificativa fica em Meus artigos, não aqui.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'policyItem' => $this->policyItem,
            'url' => $this->target(),
        ];
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
