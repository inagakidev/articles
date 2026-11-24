<?php

namespace App\Domain\Interactions\Actions;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Interactions\Events\CommentPosted;
use App\Domain\Interactions\Exceptions\InteractionRefused;
use App\Domain\Interactions\Rules\CommentRules;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Publica um comentário ou uma resposta (RF-138 a RF-140): só em artigo
 * visível, até 3 níveis e no máximo um a cada 30 segundos por pessoa. A
 * contagem do intervalo vem do banco, então vale entre aparelhos.
 */
class PostComment
{
    public function __construct(private readonly PublicArticles $articles) {}

    /** @throws InteractionRefused */
    public function handle(Article $article, User $user, string $body, ?Comment $parent = null): Comment
    {
        if (! $this->articles->query()->whereKey($article->id)->exists()) {
            throw InteractionRefused::notVisible();
        }

        if ($parent !== null && ($parent->article_id !== $article->id || $parent->depth >= CommentRules::MAX_DEPTH)) {
            throw InteractionRefused::tooDeep();
        }

        return DB::transaction(function () use ($article, $user, $body, $parent) {
            // Trava a conta para dois envios ao mesmo tempo não passarem juntos
            User::query()->whereKey($user->id)->lockForUpdate()->first();
            $last = Comment::query()->where('user_id', $user->id)->latest('created_at')->value('created_at');

            if ($last !== null) {
                $wait = CommentRules::COOLDOWN_SECONDS - (int) now()->diffInSeconds($last, true);

                if ($wait > 0) {
                    throw InteractionRefused::tooSoon($wait);
                }
            }

            $comment = Comment::query()->create([
                'article_id' => $article->id,
                'user_id' => $user->id,
                'parent_id' => $parent?->id,
                'depth' => $parent === null ? 1 : $parent->depth + 1,
                'body' => $body,
            ]);

            // Avisa quem escreveu o artigo ou o comentário respondido (RF-183, RF-185)
            CommentPosted::dispatch($comment);

            return $comment;
        });
    }
}
