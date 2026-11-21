<?php

namespace App\Domain\Taxonomy\Queries;

use App\Domain\Taxonomy\Rules\TagName;
use App\Models\Tag;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * As tags para a administração (RF-129): uso em artigos, estado e, quando
 * houver, a sugestão de união com uma tag parecida e mais usada (D79).
 */
class TagIndex
{
    public const PER_PAGE = 25;

    /** @return LengthAwarePaginator<int, array{id: int, name: string, articles: int, blocked: bool, mergeInto: array{id: int, name: string}|null}> */
    public function page(?string $search, int $page = 1): LengthAwarePaginator
    {
        $usage = DB::table('article_version_tag')
            ->join('article_versions', 'article_versions.id', '=', 'article_version_tag.article_version_id')
            ->select('article_version_tag.tag_id', DB::raw('count(distinct article_versions.article_id) as articles'))
            ->groupBy('article_version_tag.tag_id');

        $paginator = Tag::query()
            ->canonical()
            ->leftJoinSub($usage, 'usage', 'usage.tag_id', '=', 'tags.id')
            ->select('tags.*', DB::raw('coalesce(usage.articles, 0) as articles'))
            ->when($search !== null && $search !== '', fn ($query) => $query->where('tags.name', 'like', '%'.TagName::normalize((string) $search).'%'))
            ->orderByDesc('articles')
            ->orderBy('tags.name')
            ->paginate(self::PER_PAGE, page: $page)
            ->withQueryString();

        $suggestions = $this->suggestions();

        return $paginator->through(fn (Tag $tag) => [
            'id' => $tag->id,
            'name' => $tag->name,
            'articles' => (int) $tag->getAttribute('articles'),
            'blocked' => $tag->isBlocked(),
            'mergeInto' => $suggestions->get($tag->id),
        ]);
    }

    /**
     * Para cada tag com uma parecida mais usada, a sugestão de união.
     *
     * @return Collection<int, array{id: int, name: string}>
     */
    private function suggestions(): Collection
    {
        $tags = Tag::query()->canonical()->whereNull('blocked_at')
            ->withCount('versions')
            ->get(['id', 'name']);

        $suggestions = [];

        foreach ($tags->groupBy(fn (Tag $tag) => TagName::looseKey($tag->name)) as $group) {
            if ($group->count() < 2) {
                continue;
            }

            // A principal é a mais usada; no empate, a forma mais curta ("react").
            $main = $group->sortBy(fn (Tag $tag) => [-(int) $tag->getAttribute('versions_count'), strlen($tag->name)])->first();

            foreach ($group as $tag) {
                if (! $tag->is($main)) {
                    $suggestions[$tag->id] = ['id' => $main->id, 'name' => $main->name];
                }
            }
        }

        return collect($suggestions);
    }
}
