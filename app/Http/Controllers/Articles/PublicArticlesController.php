<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Interactions\Queries\ArticleComments;
use App\Domain\Interactions\Rules\CommentRules;
use App\Domain\Moderation\Queries\ContentPolicyItems;
use App\Domain\Search\Queries\ArticleSearch;
use App\Http\Controllers\Controller;
use App\Http\Requests\Articles\SearchRequest;
use App\Http\Resources\Articles\ArticlePage;
use App\Http\Resources\Articles\ArticleSummaryResource;
use App\Http\Resources\Articles\SearchOptions;
use App\Http\Resources\Interactions\CommentThread;
use App\Models\ArticleVersion;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Listagem em `/artigos` e leitura em `/artigos/{slug}` (RF-002, RF-133,
 * RF-137, RF-379), sempre pela regra única de visibilidade. A leitura traz
 * as curtidas e os comentários (D88).
 */
class PublicArticlesController extends Controller
{
    public function __construct(private readonly PublicArticles $articles) {}

    /**
     * A listagem é a busca sem termo: os mesmos filtros e a mesma ordem
     * (D85), com as categorias também em chips (prancha "Home").
     */
    public function index(SearchRequest $request, ArticleSearch $search, SearchOptions $options): Response
    {
        $criteria = $request->criteria();
        $page = $search->paginate($criteria);

        return Inertia::render('articles/index', [
            // Só as categorias que têm o que ler, para nenhum chip dar em nada
            'categories' => Category::query()
                ->whereIn('id', ArticleVersion::query()
                    ->whereIn('id', $this->articles->query()->select('current_version_id'))
                    ->select('category_id'))
                ->orderBy('id')
                ->get()
                ->map(fn (Category $category) => [
                    'slug' => $category->slug,
                    'name' => $category->name(),
                    'color' => $category->color->value,
                ]),
            'query' => SearchRequest::toQuery($criteria),
            'filterCount' => $criteria->filterCount(),
            'options' => $options->toArray(),
            'articles' => [
                'data' => ArticleSummaryResource::collection($page->items())->resolve(),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
                'from' => $page->firstItem(),
                'to' => $page->lastItem(),
            ],
        ]);
    }

    public function show(Request $request, string $slug, ArticlePage $page, ContentPolicyItems $items, ArticleComments $comments, CommentThread $thread): Response
    {
        $article = $this->articles->findBySlug($slug);
        abort_if($article === null, 404);
        $viewer = $request->user();
        $participates = $viewer?->hasVerifiedEmail() ?? false;
        // `comentarios` é a página da conversa (D88)
        $conversation = $comments->for($article, $viewer, $request->integer('comentarios', 1));
        $version = $article->currentVersion;

        // "Atualizado em" só quando outra versão foi aprovada depois (RF-137)
        $updatedAt = $version->decided_at?->toDateString();
        $publishedAt = $article->first_published_at?->toDateString();

        return Inertia::render('articles/show', [
            'article' => [
                ...$page->for($article, $version),
                'publishedAt' => $publishedAt,
                'updatedAt' => $updatedAt !== null && $updatedAt > $publishedAt ? $updatedAt : null,
            ],
            // Curtidas: a contagem é pública; quem curtiu, não (RF-151, RF-152)
            'likes' => [
                'articleId' => $article->id,
                'count' => $article->likes()->count(),
                'liked' => $viewer !== null && $article->likes()->where('user_id', $viewer->id)->exists(),
                'canLike' => $participates && $article->user_id !== $viewer->id,
            ],
            // Qualquer pessoa lê; só conta confirmada participa (RF-140, RF-141)
            'comments' => [
                'total' => $conversation['total'],
                'items' => $thread->build($conversation['comments'], $article, $viewer),
                'page' => $conversation['page'],
                'lastPage' => $conversation['lastPage'],
                'canComment' => $participates,
                'maxLength' => CommentRules::MAX_LENGTH,
            ],
            // Despublicar e excluir de vez, só para a administradora (D87)
            'moderation' => $request->user()?->is_admin
                ? ['articleId' => $article->id, 'policyItems' => $items->all()]
                : null,
        ]);
    }
}
