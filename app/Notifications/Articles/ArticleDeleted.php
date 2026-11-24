<?php

namespace App\Notifications\Articles;

use Illuminate\Notifications\Messages\MailMessage;

/** O artigo foi excluído de vez pela moderação (RF-122, RF-257). */
class ArticleDeleted extends ModerationNotification
{
    public function toMail(object $notifiable): MailMessage
    {
        return $this->withDecision((new MailMessage)
            ->subject(__('mail.moderation.deleted.subject'))
            ->line(__('mail.moderation.deleted.intro', ['title' => $this->title])))
            ->action(__('mail.moderation.policy_action'), $this->policyUrl());
    }

    public function databaseType(object $notifiable): string
    {
        return 'article.deleted';
    }

    protected function target(): string
    {
        return route('policies.content', ['item' => $this->policyItem], absolute: false);
    }
}
