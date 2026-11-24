<?php

namespace App\Domain\Interactions\Queries;

use App\Domain\Articles\Queries\PublicArticles;
use App\Models\Favorite;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * A lista de favoritos de uma pessoa (RF-160), só para ela. Um artigo que
 * saiu do ar (despublicado, na lixeira) continua na lista como
 * indisponível até ela remover; um artigo excluído de vez some junto
 * (RF-372).
 */
class UserFavorites
{
    public const PER_PAGE = 12;

    public function __construct(private readonly PublicArticles $articles) {}

    /**
     * @param  'saved'|'published'  $sort  Salvos ou publicados mais recentemente
     * @return LengthAwarePaginator<int, Favorite>
     */
    public function paginate(User $user, string $sort = 'saved', int $page = 1): LengthAwarePaginator
    {
        return Favorite::query()
            ->where('favorites.user_id', $user->id)
            ->join('articles', 'articles.id', '=', 'favorites.article_id')
            ->select('favorites.*')
            ->with(['article' => fn ($query) => $query->with([
                'author:id,name,username,avatar_path',
                'currentVersion' => fn ($version) => $version->with(['category', 'coverImage']),
            ])])
            // Visível agora pela regra única (D83); o resto aparece indisponível
            ->addSelect(['visible' => $this->articles->query()
                ->select('articles.id')
                ->whereColumn('articles.id', 'favorites.article_id')
                ->limit(1)])
            ->when(
                $sort === 'published',
                fn (Builder $query) => $query->orderByDesc('articles.first_published_at'),
            )
            ->orderByDesc('favorites.created_at')
            ->orderByDesc('favorites.article_id')
            ->paginate(self::PER_PAGE, page: $page);
    }
}
