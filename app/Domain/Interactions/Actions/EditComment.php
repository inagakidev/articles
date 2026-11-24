<?php

namespace App\Domain\Interactions\Actions;

use App\Models\Comment;

/** Edita o próprio comentário (RF-143), marcando que foi editado. */
class EditComment
{
    public function handle(Comment $comment, string $body): Comment
    {
        if ($body !== $comment->body) {
            $comment->forceFill(['body' => $body, 'edited_at' => now()])->save();
        }

        return $comment;
    }
}
