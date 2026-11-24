<?php

namespace App\Notifications\Articles;

use Illuminate\Notifications\Messages\MailMessage;

/** O artigo foi aprovado e está no ar (RF-325, RF-327). */
class VersionApproved extends ModerationNotification
{
    public function __construct(string $title, public readonly string $url, public readonly bool $edit)
    {
        parent::__construct($title);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__($this->edit ? 'mail.moderation.approved_edit.subject' : 'mail.moderation.approved.subject'))
            ->line(__($this->edit ? 'mail.moderation.approved_edit.intro' : 'mail.moderation.approved.intro', ['title' => $this->title]))
            ->action(__('mail.moderation.approved.action'), $this->url);
    }

    public function databaseType(object $notifiable): string
    {
        return 'article.approved';
    }

    protected function target(): string
    {
        return parse_url($this->url, PHP_URL_PATH) ?: $this->url;
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [...parent::toArray($notifiable), 'edit' => $this->edit];
    }
}
