<?php

namespace App\Http\Resources\Articles;

use App\Http\Resources\Accounts\PublicProfileResource;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use App\Support\Editor\ImageSource;
use App\Support\Media\ArticleImageSources;

/**
 * O artigo montado para ler: a mesma renderização na prévia e na página
 * pública (p4-06), então o que o autor vê antes de enviar é o que vai ao ar.
 */
class ArticlePage
{
    public function __construct(
        private readonly ArticleRenderer $renderer,
        private readonly DocumentSanitizer $sanitizer,
        private readonly ArticleImageSources $sources,
    ) {}

    /** @return array<string, mixed> */
    public function for(Article $article, ArticleVersion $version): array
    {
        $images = $version->images()->get();
        $rendered = $this->renderer->render($this->sanitizer->sanitize($version->content ?? DocumentSanitizer::empty()), $this->sources->for($images));
        $category = $version->category;
        $cover = $images->firstWhere('id', $version->cover_image_id);

        return [
            'title' => $version->title,
            'language' => $version->language,
            'category' => $category === null ? null : [
                'name' => $category->name(),
                'color' => $category->color->value,
                'slug' => $category->slug,
            ],
            'tags' => $version->tags()->orderBy('name')->pluck('name'),
            'cover' => $cover === null ? null : $this->cover($this->sources->source($cover), $version),
            'html' => $rendered->html,
            'toc' => $rendered->toc,
            'readingMinutes' => $rendered->readingMinutes,
            // Conta excluída: o artigo fica, com o autor removido (RF-051)
            'author' => $article->author === null
                ? ['name' => __('article.removed_author'), 'username' => null, 'bio' => null, 'avatar' => null]
                : new PublicProfileResource($article->author),
        ];
    }

    /** @return array{src: string, srcset: string, width: int, height: int, alt: string} */
    private function cover(ImageSource $source, ArticleVersion $version): array
    {
        return [
            'src' => $source->src,
            'srcset' => $source->srcset(),
            'width' => $source->width,
            'height' => $source->height,
            // Decorativa: alt vazio, para o leitor de tela pular (RF-087)
            'alt' => $version->cover_decorative ? '' : ($version->cover_alt ?? ''),
        ];
    }
}
