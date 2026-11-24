<?php

namespace App\Policies;

use App\Domain\Articles\Queries\PublicArticles;
use App\Models\ArticleImage;
use App\Models\User;

/**
 * Quem vê uma imagem de artigo (RF-090, D53): todo mundo, quando a versão
 * em vigor de um artigo publicado a usa; fora disso, só o autor e a
 * administradora.
 */
class ArticleImagePolicy
{
    public function __construct(private readonly PublicArticles $articles) {}

    public function view(?User $user, ArticleImage $image): bool
    {
        if ($this->isPublic($image)) {
            return true;
        }

        return $user !== null && ($user->is_admin || $image->article->user_id === $user->id);
    }

    public function isPublic(ArticleImage $image): bool
    {
        // A mesma regra das páginas públicas (§5.3), e só a versão em vigor
        $current = $this->articles->query()->whereKey($image->article_id)->value('current_version_id');

        return $current !== null && $image->versions()->whereKey($current)->exists();
    }
}
