<?php

namespace App\Http\Resources\Articles;

use App\Models\Article;
use App\Support\Editor\ArticleRenderer;
use App\Support\Media\ArticleImageSources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * O cartão de um artigo publicado (`ArticleSummary` no frontend): nunca o
 * documento inteiro nem dados da conta de quem escreveu.
 *
 * @mixin Article
 */
class ArticleSummaryResource extends JsonResource
{
    /** Caracteres do resumo tirado do começo do texto. */
    public const EXCERPT = 180;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $version = $this->currentVersion;
        $text = $version->content_text ?? '';
        $category = $version->category;
        $cover = $version->coverImage;

        return [
            'url' => route('articles.show', $this->slug, absolute: false),
            'title' => $version->title,
            'excerpt' => Str::limit(Str::squish($text), self::EXCERPT),
            'cover' => $cover === null ? null : ArticleImageSources::url($cover->pathFor(960)),
            'category' => $category === null ? null : [
                'name' => $category->name(),
                'color' => $category->color->value,
            ],
            // Conta excluída: o artigo fica, com o autor removido (RF-051)
            'author' => [
                'name' => $this->author->name ?? __('article.removed_author'),
                'avatar' => $this->author?->avatar,
            ],
            'publishedAt' => $this->first_published_at?->toDateString(),
            'readingMinutes' => ArticleRenderer::readingMinutes(ArticleRenderer::countWords($text)),
        ];
    }
}
