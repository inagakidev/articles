<?php

namespace App\Domain\Interactions\Actions;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Interactions\Exceptions\InteractionRefused;
use App\Models\Article;
use App\Models\Favorite;
use App\Models\User;
use Carbon\CarbonInterface;

/**
 * Salva e tira artigos dos favoritos (RF-159 a RF-162). Um favorito por
 * pessoa e artigo, garantido pela chave do banco. Favoritar o próprio
 * artigo vale (RF-150); só artigo visível entra na lista, mas qualquer um
 * sai dela, mesmo fora do ar.
 */
class FavoriteArticle
{
    public function __construct(private readonly PublicArticles $articles) {}

    /**
     * @param  CarbonInterface|null  $savedAt  Para o "Desfazer" devolver o artigo ao mesmo lugar da lista
     *
     * @throws InteractionRefused
     */
    public function add(Article $article, User $user, ?CarbonInterface $savedAt = null): void
    {
        if (! $this->articles->query()->whereKey($article->id)->exists()) {
            throw InteractionRefused::notVisible();
        }

        Favorite::query()->insertOrIgnore([
            'article_id' => $article->id,
            'user_id' => $user->id,
            'created_at' => $savedAt !== null && $savedAt->isPast() ? $savedAt : now(),
        ]);
    }

    public function remove(Article $article, User $user): void
    {
        Favorite::query()->where(['article_id' => $article->id, 'user_id' => $user->id])->delete();
    }
}
