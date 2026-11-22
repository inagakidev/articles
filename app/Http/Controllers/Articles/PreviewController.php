<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Actions\StartDraft;
use App\Http\Controllers\Controller;
use App\Http\Resources\Accounts\PublicProfileResource;
use App\Models\Article;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Prévia do rascunho (RF-072, p4-06): a mesma renderização da página
 * pública, então o que se vê aqui é o que vai ao ar.
 */
class PreviewController extends Controller
{
    public function __invoke(Article $article, StartDraft $start, ArticleRenderer $renderer, DocumentSanitizer $sanitizer): Response
    {
        Gate::authorize('update', $article);

        $draft = $start->handle($article);
        $rendered = $renderer->render($sanitizer->sanitize($draft->content ?? DocumentSanitizer::empty()));
        $category = $draft->category;

        return Inertia::render('articles/preview', [
            'articleId' => $article->id,
            'article' => [
                'title' => $draft->title,
                'language' => $draft->language,
                'category' => $category === null ? null : [
                    'name' => $category->name(),
                    'color' => $category->color->value,
                ],
                'tags' => $draft->tags()->orderBy('name')->pluck('name'),
                'html' => $rendered->html,
                'toc' => $rendered->toc,
                'readingMinutes' => $rendered->readingMinutes,
                'author' => new PublicProfileResource($article->author),
            ],
        ]);
    }
}
