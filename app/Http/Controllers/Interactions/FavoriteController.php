<?php

namespace App\Http\Controllers\Interactions;

use App\Domain\Interactions\Actions\FavoriteArticle;
use App\Domain\Interactions\Exceptions\InteractionRefused;
use App\Domain\Interactions\Queries\UserFavorites;
use App\Http\Controllers\Controller;
use App\Http\Requests\Interactions\FavoritesRequest;
use App\Http\Resources\Articles\ArticleSummaryResource;
use App\Models\Article;
use App\Models\Favorite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;
use Inertia\Response;

/** Favoritos: salvar, tirar e a lista privada (RF-159 a RF-162, D89). */
class FavoriteController extends Controller
{
    public function index(FavoritesRequest $request, UserFavorites $favorites): Response
    {
        $sort = $request->sort();
        $page = $favorites->paginate($request->user(), $sort, $request->integer('page', 1));

        return Inertia::render('favorites/index', [
            'sort' => $request->sortParam(),
            'favorites' => [
                'data' => collect($page->items())->map(fn (Favorite $favorite) => [
                    'articleId' => $favorite->article_id,
                    'savedAt' => $favorite->created_at->toIso8601String(),
                    // Fora do ar, só o aviso: nada do conteúdo (RF-160, RF-372)
                    'article' => $favorite->getAttribute('visible') === null
                        ? null
                        : (new ArticleSummaryResource($favorite->article))->resolve(),
                ])->all(),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }

    public function store(Request $request, Article $article, FavoriteArticle $favorites): RedirectResponse
    {
        $request->validate(['saved_at' => ['nullable', 'date']]);

        try {
            $favorites->add($article, $request->user(), $request->filled('saved_at') ? Date::parse($request->string('saved_at')) : null);
        } catch (InteractionRefused $refused) {
            abort(403, __($refused->getMessage()));
        }

        return back();
    }

    public function destroy(Request $request, Article $article, FavoriteArticle $favorites): RedirectResponse
    {
        $favorites->remove($article, $request->user());

        return back();
    }
}
