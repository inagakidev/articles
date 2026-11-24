<?php

namespace App\Domain\Notifications;

use App\Domain\Interactions\Queries\ArticleComments;
use App\Models\Comment;

/** O endereço de um comentário na leitura, já na página da conversa dele. */
class CommentLink
{
    public function __construct(private readonly ArticleComments $comments) {}

    public function for(Comment $comment): string
    {
        $page = $this->comments->pageOf($comment);

        return route('articles.show', array_filter([
            'slug' => $comment->article->slug,
            'comentarios' => $page > 1 ? $page : null,
        ]), absolute: false).'#comentario-'.$comment->id;
    }
}
