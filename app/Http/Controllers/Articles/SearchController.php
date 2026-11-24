<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Queries\ArticleSearch;
use App\Domain\Articles\Queries\PublicArticles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Articles\SearchRequest;
use App\Http\Resources\Articles\ArticleSummaryResource;
use App\Http\Resources\Articles\SearchOptions;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Busca em `/busca` (RF-003, RF-130 a RF-136, pranchas "Busca com filtros"
 * e "Busca sem resultados"). Sem resultado, sugere os mais recentes da
 * categoria escolhida, ou de todas.
 */
class SearchController extends Controller
{
    /** Cartões sugeridos quando a busca não acha nada. */
    public const SUGGESTED = 3;

    public function __invoke(SearchRequest $request, ArticleSearch $search, PublicArticles $articles, SearchOptions $options): Response
    {
        $criteria = $request->criteria();
        $page = $search->paginate($criteria);
        $category = $criteria->category === null ? null : Category::query()->where('slug', $criteria->category)->first();

        return Inertia::render('search/index', [
            'query' => SearchRequest::toQuery($criteria),
            'filterCount' => $criteria->filterCount(),
            // Algum termo ficou de fora do índice (Go, JS, UI): avisa (D85)
            'shortTerms' => ArticleSearch::terms($criteria->text)['short'] !== [],
            'results' => [
                'data' => ArticleSummaryResource::collection($page->items())->resolve(),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
            ],
            'suggested' => $page->total() > 0 ? [] : ArticleSummaryResource::collection($articles->recent(self::SUGGESTED, $category))->resolve(),
            'options' => $options->toArray(),
            'category' => $category === null ? null : $category->name(),
        ]);
    }
}
