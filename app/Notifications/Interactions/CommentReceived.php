<?php

namespace App\Notifications\Interactions;

use Illuminate\Notifications\Notification;

/**
 * Comentário no artigo da pessoa ou resposta a um comentário dela (RF-183,
 * RF-185, D90). Só dentro do site; o texto é montado no idioma de quem lê.
 */
class CommentReceived extends Notification
{
    /**
     * @param  'comment.posted'|'comment.replied'  $type
     * @param  array{name: string, username: string}  $actor
     */
    public function __construct(
        public readonly string $type,
        public readonly string $title,
        public readonly string $url,
        public readonly array $actor,
        public readonly string $excerpt,
    ) {}

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function databaseType(object $notifiable): string
    {
        return $this->type;
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'url' => $this->url,
            'actor' => $this->actor,
            'excerpt' => $this->excerpt,
        ];
    }
}
