<?php

namespace App\Http\Resources\Articles;

use App\Domain\Articles\Queries\PublicArticles;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Tag;

/**
 * O que os filtros oferecem, na listagem e na busca (D85): as categorias,
 * os idiomas e as tags dos artigos visíveis, das mais usadas para as menos.
 */
class SearchOptions
{
    /** Tags oferecidas no filtro. */
    public const TAGS = 50;

    public function __construct(private readonly PublicArticles $articles) {}

    /** @return array{categories: list<array{slug: string, name: string}>, languages: list<string>, tags: list<string>} */
    public function toArray(): array
    {
        $visibleVersions = ArticleVersion::query()
            ->whereIn('id', $this->articles->query()->select('current_version_id'))
            ->select('id');

        return [
            'categories' => array_values(Category::query()->orderBy('id')->get()
                ->map(fn (Category $category) => ['slug' => $category->slug, 'name' => $category->name()])
                ->all()),
            'languages' => array_values(config('app.locales')),
            'tags' => array_values(Tag::query()
                ->whereHas('versions', fn ($versions) => $versions->whereIn('article_versions.id', $visibleVersions))
                ->withCount(['versions' => fn ($versions) => $versions->whereIn('article_versions.id', $visibleVersions)])
                ->orderByDesc('versions_count')
                ->orderBy('name')
                ->limit(self::TAGS)
                ->pluck('name')
                ->all()),
        ];
    }
}
