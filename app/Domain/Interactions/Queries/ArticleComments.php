<?php

namespace App\Domain\Interactions\Queries;

use App\Domain\Interactions\Rules\CommentRules;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * Os comentários de um artigo, em ordem de conversa (RF-140): quem
 * escreveu, a contagem pública de curtidas e se quem está lendo já curtiu.
 * Quem curtiu cada um nunca sai daqui (RF-151, RF-156).
 *
 * A conversa vem em páginas de comentários de primeiro nível, cada um com
 * todas as respostas, para um artigo muito comentado não carregar tudo de
 * uma vez (D88).
 */
class ArticleComments
{
    public const PER_PAGE = 20;

    /**
     * As primeiras `$pages` páginas da conversa.
     *
     * @return array{comments: Collection<int, Comment>, total: int, pages: int, hasMore: bool}
     */
    public function for(Article $article, ?User $viewer, int $pages = 1): array
    {
        $roots = Comment::query()->where('article_id', $article->id)->whereNull('parent_id')->count();
        // Página que não existe mostra até a última, sem carregar além dela
        $pages = max(1, min($pages, (int) ceil($roots / self::PER_PAGE)));

        $comments = $this->query($article, $viewer)
            ->whereNull('parent_id')
            ->limit($pages * self::PER_PAGE)
            ->get();

        // As respostas, nível a nível, só das conversas desta página
        $parents = $comments->modelKeys();
        for ($depth = 2; $depth <= CommentRules::MAX_DEPTH && $parents !== []; $depth++) {
            $level = $this->query($article, $viewer)->whereIn('parent_id', $parents)->get();
            $comments = $comments->concat($level);
            $parents = $level->modelKeys();
        }

        return [
            'comments' => $comments,
            'total' => Comment::query()->where('article_id', $article->id)->count(),
            'pages' => $pages,
            'hasMore' => $pages * self::PER_PAGE < $roots,
        ];
    }

    /** Em que página da conversa está um comentário de primeiro nível. */
    public function pageOf(Comment $root): int
    {
        $before = Comment::query()
            ->where('article_id', $root->article_id)
            ->whereNull('parent_id')
            ->where(fn (Builder $query) => $query
                ->where('created_at', '<', $root->created_at)
                ->orWhere(fn (Builder $same) => $same->where('created_at', $root->created_at)->where('id', '<=', $root->id)))
            ->count();

        return max(1, (int) ceil($before / self::PER_PAGE));
    }

    /** @return Builder<Comment> */
    private function query(Article $article, ?User $viewer): Builder
    {
        return Comment::query()
            ->where('article_id', $article->id)
            ->with('author:id,name,username,avatar_path')
            ->withCount('likes')
            ->when($viewer, fn (Builder $query, User $viewer) => $query->withExists([
                'likes as liked' => fn (Builder $likes) => $likes->where('user_id', $viewer->id),
            ]))
            ->orderBy('created_at')
            ->orderBy('id');
    }
}
