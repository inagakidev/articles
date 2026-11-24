<?php

namespace App\Http\Resources\Interactions;

use App\Domain\Interactions\Rules\CommentRules;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

/**
 * A conversa de um artigo em árvore, para a leitura (prancha "Comentários ·
 * logada"): cada comentário com quem escreveu, a contagem de curtidas, se
 * quem lê já curtiu e o que essa pessoa pode fazer com ele. Nunca envia
 * quem curtiu (RF-151).
 */
class CommentThread
{
    /**
     * @param  Collection<int, Comment>  $comments  Em ordem de conversa
     * @param  list<int>  $reported  Comentários que quem lê já denunciou e estão em análise
     * @return list<array<string, mixed>>
     */
    public function build(Collection $comments, Article $article, ?User $viewer, array $reported = []): array
    {
        $participates = $viewer?->hasVerifiedEmail() ?? false;
        $byParent = $comments->groupBy(fn (Comment $comment) => $comment->parent_id ?? 0);

        $node = function (Comment $comment) use (&$node, $byParent, $article, $viewer, $participates, $reported): array {
            $own = $viewer !== null && $comment->user_id === $viewer->id;

            return [
                'id' => $comment->id,
                'body' => $comment->body,
                'depth' => $comment->depth,
                'createdAt' => $comment->created_at?->toIso8601String(),
                'edited' => $comment->edited_at !== null,
                'author' => [
                    'name' => $comment->author->name,
                    'username' => $comment->author->username,
                    'avatar' => $comment->author->avatar,
                ],
                'isArticleAuthor' => $comment->user_id === $article->user_id,
                'own' => $own,
                'likes' => [
                    'count' => (int) $comment->getAttribute('likes_count'),
                    'liked' => (bool) $comment->getAttribute('liked'),
                ],
                'can' => [
                    'like' => $participates && ! $own,
                    'reply' => $participates && $comment->depth < CommentRules::MAX_DEPTH,
                    'edit' => $viewer !== null && Gate::forUser($viewer)->allows('update', $comment),
                    'delete' => $viewer !== null && Gate::forUser($viewer)->allows('delete', $comment),
                    'moderate' => $viewer !== null && Gate::forUser($viewer)->allows('moderate', $comment),
                    // A autora do artigo também denuncia comentários nele (RF-169)
                    'report' => $participates && ! $own,
                ],
                'reported' => in_array($comment->id, $reported, true),
                'replies' => array_values($byParent->get($comment->id, collect())->map($node)->all()),
            ];
        };

        return array_values($byParent->get(0, collect())->map($node)->all());
    }
}
