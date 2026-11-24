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
 * todas as respostas, para a leitura não virar uma rolagem sem fim (D88).
 */
class ArticleComments
{
    public const PER_PAGE = 5;

    /**
     * Uma página da conversa.
     *
     * @return array{comments: Collection<int, Comment>, total: int, page: int, lastPage: int}
     */
    public function for(Article $article, ?User $viewer, int $page = 1): array
    {
        $roots = Comment::query()->where('article_id', $article->id)->whereNull('parent_id')->count();
        $lastPage = max(1, (int) ceil($roots / self::PER_PAGE));
        // Página que não existe (inclusive depois de apagar) mostra a mais próxima
        $page = max(1, min($page, $lastPage));

        $comments = $this->query($article, $viewer)
            ->whereNull('parent_id')
            ->offset(($page - 1) * self::PER_PAGE)
            ->limit(self::PER_PAGE)
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
            'page' => $page,
            'lastPage' => $lastPage,
        ];
    }

    /** Em que página da conversa está um comentário (pelo de primeiro nível dele). */
    public function pageOf(Comment $comment): int
    {
        $root = $comment;
        while ($root->parent_id !== null) {
            $root = Comment::query()->findOrFail($root->parent_id);
        }

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
