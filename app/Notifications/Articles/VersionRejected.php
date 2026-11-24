<?php

namespace App\Notifications\Articles;

use Illuminate\Notifications\Messages\MailMessage;

/**
 * A versão não foi aprovada (RF-107, RF-108, RF-327): a justificativa, o
 * item da Política e o caminho para corrigir e reenviar. Numa edição, o
 * texto diz que a versão publicada continua no ar (RF-110).
 */
class VersionRejected extends ModerationNotification
{
    public function __construct(string $title, string $reason, string $policyItem, public readonly bool $edit)
    {
        parent::__construct($title, $reason, $policyItem);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject(__('mail.moderation.rejected.subject'))
            ->line(__('mail.moderation.rejected.intro', ['title' => $this->title]));

        if ($this->edit) {
            $mail->line(__('mail.moderation.rejected.still_live'));
        }

        return $this->withDecision($mail)
            ->line(__('mail.moderation.rejected.next'))
            ->action(__('mail.moderation.rejected.action'), route('articles.mine'));
    }

    public function databaseType(object $notifiable): string
    {
        return 'article.rejected';
    }

    protected function target(): string
    {
        return route('articles.mine', absolute: false);
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [...parent::toArray($notifiable), 'edit' => $this->edit];
    }
}
