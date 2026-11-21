<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Actions\StartDraft;
use App\Http\Controllers\Controller;
use App\Http\Requests\Articles\DraftRequest;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Support\Editor\EditorSchema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * O editor (prancha "Editor"). Um artigo novo só é criado no primeiro
 * salvamento, para "Escrever" não deixar rascunhos vazios para trás.
 */
class EditorController extends Controller
{
    public function create(Request $request): Response
    {
        Gate::authorize('create', Article::class);

        return $this->render(null, null, $request);
    }

    public function edit(Request $request, Article $article, StartDraft $start): Response
    {
        Gate::authorize('update', $article);

        return $this->render($article, $start->handle($article), $request);
    }

    private function render(?Article $article, ?ArticleVersion $draft, Request $request): Response
    {
        return Inertia::render('articles/edit', [
            'articleId' => $article?->id,
            'published' => $article?->current_version_id !== null,
            'draft' => [
                'title' => $draft->title ?? '',
                'content' => $draft?->content,
                // Artigo novo já vem no idioma da interface (prancha "Editor vazio")
                'language' => $draft === null ? app()->getLocale() : $draft->language,
                'categoryId' => $draft?->category_id,
                'tags' => $draft?->tags()->orderBy('name')->pluck('name') ?? [],
                'updatedAt' => $draft?->updated_at?->toIso8601String(),
                'createdAt' => $draft?->created_at?->toIso8601String(),
            ],
            'categories' => Category::query()->orderBy('id')->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name(),
                    'color' => $category->color->value,
                ]),
            'limits' => [
                'title' => 150,
                'characters' => EditorSchema::MAX_CHARACTERS,
                'tags' => DraftRequest::MAX_TAGS,
                'wordsPerMinute' => EditorSchema::WORDS_PER_MINUTE,
            ],
            'colors' => EditorSchema::COLORS,
            'codeLanguages' => EditorSchema::CODE_LANGUAGES,
        ]);
    }
}
