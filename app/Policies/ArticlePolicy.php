<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

/**
 * Escrever e editar (RF-301, RF-302). A conta confirmada já é exigida pela
 * rota; suspensão e banimento entram com as penalidades (fatia 21).
 */
class ArticlePolicy
{
    public function create(User $user): bool
    {
        return $user->hasVerifiedEmail();
    }

    /** Só quem escreveu edita, e não com o artigo na lixeira. */
    public function update(User $user, Article $article): bool
    {
        return $article->user_id === $user->id && ! $article->trashed();
    }
}
