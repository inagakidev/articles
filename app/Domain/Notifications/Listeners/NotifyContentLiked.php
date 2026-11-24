<?php

namespace App\Domain\Notifications\Listeners;

use App\Domain\Interactions\Events\ContentLiked;
use App\Domain\Notifications\Actions\GroupLike;
use App\Domain\Notifications\CommentLink;
use App\Models\Article;
use App\Models\User;

/** Avisa quem escreveu o artigo ou o comentário curtido (RF-184). */
class NotifyContentLiked
{
    public function __construct(
        private readonly GroupLike $group,
        private readonly CommentLink $links,
    ) {}

    public function handle(ContentLiked $event): void
    {
        $item = $event->item;
        $recipient = User::query()->find($item->user_id);

        if ($recipient === null) {
            return;
        }

        if ($item instanceof Article) {
            $this->group->handle($recipient, $event->liker, 'article', $item->id, (string) $item->currentVersion?->title, route('articles.show', $item->slug, absolute: false));

            return;
        }

        $this->group->handle($recipient, $event->liker, 'comment', $item->id, (string) $item->article->currentVersion?->title, $this->links->for($item));
    }
}
