<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Queries\WorkingVersion;
use App\Http\Controllers\Controller;
use App\Http\Resources\Accounts\PublicProfileResource;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use App\Support\Editor\ImageSource;
use App\Support\Media\ArticleImageSources;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Prévia (RF-072, p4-06): a mesma renderização da página pública, então
 * o que se vê aqui é o que vai ao ar. Daqui também se envia (RF-323).
 */
class PreviewController extends Controller
{
    public function __invoke(Request $request, Article $article, WorkingVersion $working, ArticleRenderer $renderer, DocumentSanitizer $sanitizer, ArticleImageSources $sources): Response
    {
        Gate::authorize('update', $article);

        // "Ver versão enviada" pede uma versão; sem ela, a que o autor tem em mãos.
        $draft = $request->filled('version')
            ? $article->versions()->findOrFail($request->integer('version'))
            : $working->for($article);

        abort_if($draft === null, 404);
        $images = $draft->images()->get();
        $rendered = $renderer->render($sanitizer->sanitize($draft->content ?? DocumentSanitizer::empty()), $sources->for($images));
        $category = $draft->category;
        $cover = $images->firstWhere('id', $draft->cover_image_id);

        return Inertia::render('articles/preview', [
            'articleId' => $article->id,
            // Só o rascunho é enviado, e só sem outra versão na fila (RF-102)
            'canSubmit' => $draft->status === VersionStatus::Draft
                && ! $article->versions()->where('status', VersionStatus::Pending)->exists(),
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
