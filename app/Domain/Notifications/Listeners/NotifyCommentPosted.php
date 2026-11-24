<?php

namespace App\Domain\Notifications\Listeners;

use App\Domain\Interactions\Events\CommentPosted;
use App\Domain\Notifications\CommentLink;
use App\Models\Comment;
use App\Models\User;
use App\Notifications\Interactions\CommentReceived;
use Illuminate\Support\Str;

/**
 * Avisa a autora do artigo de um comentário novo (RF-183) e quem foi
 * respondido (RF-185). Ninguém é avisado do que ela mesma escreveu, e
 * quem é as duas coisas recebe só o aviso da resposta.
 */
class NotifyCommentPosted
{
    /** Caracteres do trecho do comentário no aviso. */
    public const EXCERPT = 80;

    public function __construct(private readonly CommentLink $links) {}

    public function handle(CommentPosted $event): void
    {
        $comment = $event->comment->loadMissing(['article', 'author', 'parent']);
        $author = $comment->author;

        $replied = $comment->parent?->user_id;
        if ($replied !== null && $replied !== $author->id) {
            User::query()->find($replied)?->notify($this->notice($comment, 'comment.replied'));
        }

        $articleAuthor = $comment->article->user_id;
        if ($articleAuthor !== $author->id && $articleAuthor !== $replied) {
            User::query()->find($articleAuthor)?->notify($this->notice($comment, 'comment.posted'));
        }
    }

    /** @param  'comment.posted'|'comment.replied'  $type */
    private function notice(Comment $comment, string $type): CommentReceived
    {
        return new CommentReceived(
            $type,
            (string) $comment->article->currentVersion?->title,
            $this->links->for($comment),
            ['name' => $comment->author->name, 'username' => $comment->author->username],
            Str::limit(Str::squish($comment->body), self::EXCERPT),
        );
    }
}
