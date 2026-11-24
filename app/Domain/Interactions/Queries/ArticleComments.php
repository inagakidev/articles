<?php

namespace App\Domain\Interactions\Queries;

use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * Os comentários de um artigo, em ordem de conversa (RF-140): quem
 * escreveu, a contagem pública de curtidas e se quem está lendo já curtiu.
 * Quem curtiu cada um nunca sai daqui (RF-151, RF-156).
 */
class ArticleComments
{
    /** @return Collection<int, Comment> */
    public function for(Article $article, ?User $viewer): Collection
    {
        return Comment::query()
            ->where('article_id', $article->id)
            ->with('author:id,name,username,avatar_path')
            ->withCount('likes')
            ->when($viewer, fn (Builder $query, User $viewer) => $query->withExists([
                'likes as liked' => fn (Builder $likes) => $likes->where('user_id', $viewer->id),
            ]))
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();
    }
}
