<?php

namespace App\Domain\Interactions\Actions;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Interactions\Events\ContentLiked;
use App\Domain\Interactions\Exceptions\InteractionRefused;
use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\User;

/**
 * Curte e descurte artigos e comentários (RF-148 a RF-156). Uma curtida
 * por pessoa e item, garantida pela chave do banco: curtir de novo não
 * duplica. Ninguém curte o próprio conteúdo, e só artigo visível recebe
 * curtidas.
 */
class LikeContent
{
    public function __construct(private readonly PublicArticles $articles) {}

    /** @throws InteractionRefused */
    public function article(Article $article, User $user, bool $like): void
    {
        $this->ensureVisible($article->id);

        if ($article->user_id === $user->id) {
            throw InteractionRefused::ownContent();
        }

        if (! $like) {
            ArticleLike::query()->where(['article_id' => $article->id, 'user_id' => $user->id])->delete();

            return;
        }

        // Só uma curtida nova avisa a autora (RF-184)
        if (ArticleLike::query()->insertOrIgnore(['article_id' => $article->id, 'user_id' => $user->id, 'created_at' => now()]) > 0) {
            ContentLiked::dispatch($user, $article);
        }
    }

    /** @throws InteractionRefused */
    public function comment(Comment $comment, User $user, bool $like): void
    {
        $this->ensureVisible($comment->article_id);

        if ($comment->user_id === $user->id) {
            throw InteractionRefused::ownContent();
        }

        if (! $like) {
            CommentLike::query()->where(['comment_id' => $comment->id, 'user_id' => $user->id])->delete();

            return;
        }

        if (CommentLike::query()->insertOrIgnore(['comment_id' => $comment->id, 'user_id' => $user->id, 'created_at' => now()]) > 0) {
            ContentLiked::dispatch($user, $comment);
        }
    }

    private function ensureVisible(int $articleId): void
    {
        if (! $this->articles->query()->whereKey($articleId)->exists()) {
            throw InteractionRefused::notVisible();
        }
    }
}
