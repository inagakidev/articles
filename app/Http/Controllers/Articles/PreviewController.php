<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Actions\StartDraft;
use App\Http\Controllers\Controller;
use App\Http\Resources\Accounts\PublicProfileResource;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use App\Support\Editor\ImageSource;
use App\Support\Media\ArticleImageSources;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Prévia do rascunho (RF-072, p4-06): a mesma renderização da página
 * pública, então o que se vê aqui é o que vai ao ar.
 */
class PreviewController extends Controller
{
    public function __invoke(Article $article, StartDraft $start, ArticleRenderer $renderer, DocumentSanitizer $sanitizer, ArticleImageSources $sources): Response
    {
        Gate::authorize('update', $article);

        $draft = $start->handle($article);
        $images = $draft->images()->get();
        $rendered = $renderer->render($sanitizer->sanitize($draft->content ?? DocumentSanitizer::empty()), $sources->for($images));
        $category = $draft->category;
        $cover = $images->firstWhere('id', $draft->cover_image_id);

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
                'cover' => $cover === null ? null : $this->cover($sources->source($cover), $draft),
                'html' => $rendered->html,
                'toc' => $rendered->toc,
                'readingMinutes' => $rendered->readingMinutes,
                'author' => new PublicProfileResource($article->author),
            ],
        ]);
    }

    /** @return array{src: string, srcset: string, width: int, height: int, alt: string} */
    private function cover(ImageSource $source, ArticleVersion $draft): array
    {
        return [
            'src' => $source->src,
            'srcset' => $source->srcset(),
            'width' => $source->width,
            'height' => $source->height,
            // Decorativa: alt vazio, para o leitor de tela pular (RF-087)
            'alt' => $draft->cover_decorative ? '' : ($draft->cover_alt ?? ''),
        ];
    }
}
