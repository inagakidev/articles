<?php

namespace App\Notifications\Articles;

use Illuminate\Notifications\Messages\MailMessage;

/** O artigo saiu do ar pela moderação (RF-111, fluxo 6.5). */
class ArticleUnpublished extends ModerationNotification
{
    public function toMail(object $notifiable): MailMessage
    {
        return $this->withDecision((new MailMessage)
            ->subject(__('mail.moderation.unpublished.subject'))
            ->line(__('mail.moderation.unpublished.intro', ['title' => $this->title])))
            ->line(__('mail.moderation.rejected.next'))
            ->action(__('mail.moderation.rejected.action'), route('articles.mine'));
    }
}
