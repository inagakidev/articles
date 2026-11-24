<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;

/**
 * Quem mexe num comentário (RF-143 a RF-145). Escrever, responder e curtir
 * exigem conta confirmada, pelo middleware `verified` das rotas (RF-140).
 */
class CommentPolicy
{
    /** Só quem escreveu edita (RF-143). */
    public function update(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->id;
    }

    /** Quem escreveu e a autora do artigo apagam, sem justificativa (RF-143, RF-144). */
    public function delete(User $user, Comment $comment): bool
    {
        return $comment->user_id === $user->id || $comment->article->user_id === $user->id;
    }

    /**
     * A administradora apaga o comentário de outra pessoa como moderação,
     * com item e justificativa na auditoria (RF-145).
     */
    public function moderate(User $user, Comment $comment): bool
    {
        return $user->is_admin && $comment->user_id !== $user->id;
    }
}
