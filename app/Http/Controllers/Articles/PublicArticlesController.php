<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Queries\PublicArticles;
use App\Http\Controllers\Controller;
use App\Http\Resources\Articles\ArticlePage;
use App\Http\Resources\Articles\ArticleSummaryResource;
use App\Models\ArticleVersion;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Listagem em `/artigos` e leitura em `/artigos/{slug}` (RF-002, RF-133,
 * RF-137, RF-379), sempre pela regra única de visibilidade.
 */
class PublicArticlesController extends Controller
{
    public function __construct(private readonly PublicArticles $articles) {}

    public function index(Request $request): Response
    {
        $category = $request->filled('categoria')
            ? Category::query()->where('slug', $request->string('categoria'))->firstOrFail()
            : null;
        $page = $this->articles->paginate($category);

        return Inertia::render('articles/index', [
            // Só as categorias que têm o que ler, para nenhum filtro dar em nada
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
            'category' => $category?->slug,
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

    public function show(string $slug, ArticlePage $page): Response
    {
        $article = $this->articles->findBySlug($slug);
        abort_if($article === null, 404);
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
        ]);
    }
}
