<?php

namespace App\Policies;

use App\Domain\Articles\Enums\ArticleState;
use App\Models\ArticleImage;
use App\Models\User;

/**
 * Quem vê uma imagem de artigo (RF-090, D53): todo mundo, quando a versão
 * em vigor de um artigo publicado a usa; fora disso, só o autor e a
 * administradora.
 */
class ArticleImagePolicy
{
    public function view(?User $user, ArticleImage $image): bool
    {
        if ($this->isPublic($image)) {
            return true;
        }

        return $user !== null && ($user->is_admin || $image->article->user_id === $user->id);
    }

    public function isPublic(ArticleImage $image): bool
    {
        $article = $image->article;

        return $article->state === ArticleState::Published
            && ! $article->trashed()
            && $article->current_version_id !== null
            && $image->versions()->whereKey($article->current_version_id)->exists();
    }
}
