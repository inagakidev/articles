<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

/**
 * Escrever, editar, enviar e excluir os próprios artigos (RF-301 a RF-304).
 * A conta confirmada já é exigida pela rota; suspensão e banimento entram
 * com as penalidades (fatia 21).
 */
class ArticlePolicy
{
    public function create(User $user): bool
    {
        return $user->hasVerifiedEmail();
    }

    /** Só quem escreveu edita, envia e retira, e não com o artigo na lixeira. */
    public function update(User $user, Article $article): bool
    {
        return $article->user_id === $user->id && ! $article->trashed();
    }

    /** Mandar para a lixeira (RF-116, RF-304). */
    public function delete(User $user, Article $article): bool
    {
        return $this->update($user, $article);
    }

    /** Tirar da lixeira dentro dos sete dias (RF-118, RF-336). */
    public function restore(User $user, Article $article): bool
    {
        return $article->user_id === $user->id
            && $article->trashed()
            && $article->restorableUntil()?->isFuture() === true;
    }
}
