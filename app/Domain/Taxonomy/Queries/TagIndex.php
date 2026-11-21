<?php

namespace App\Domain\Taxonomy\Queries;

use App\Domain\Taxonomy\Rules\TagName;
use App\Models\Tag;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * As tags para a administração (RF-129): uso em artigos, estado e, quando
 * houver, a sugestão de união com uma tag parecida e mais usada (D79). O
 * custo é o da página, não o do total de tags.
 */
class TagIndex
{
    public const PER_PAGE = 25;

    /** @return LengthAwarePaginator<int, array{id: int, name: string, articles: int, blocked: bool, mergeInto: array{id: int, name: string}|null}> */
    public function page(?string $search, int $page = 1): LengthAwarePaginator
    {
        $paginator = $this->withUsage(Tag::query()->canonical())
            ->when($search !== null && $search !== '', fn ($query) => $query->where('tags.name', 'like', '%'.TagName::normalize((string) $search).'%'))
            ->orderByDesc('articles')
            ->orderBy('tags.name')
            ->paginate(self::PER_PAGE, page: $page)
            ->withQueryString();

        $suggestions = $this->suggestionsFor($paginator->getCollection());

        return $paginator->through(fn (Tag $tag) => [
            'id' => $tag->id,
            'name' => $tag->name,
            'articles' => (int) $tag->getAttribute('articles'),
            'blocked' => $tag->isBlocked(),
            'mergeInto' => $suggestions->get($tag->id),
        ]);
    }

    /**
     * A sugestão de união para as tags da página: entre as tags com a mesma
     * chave aproximada, a mais usada (no empate, a forma mais curta). Busca
     * só as parecidas com as da página, pelo índice de `loose_key`.
     *
     * @param  Collection<int, Tag>  $tags
     * @return Collection<int, array{id: int, name: string}>
     */
    private function suggestionsFor(Collection $tags): Collection
    {
        $keys = $tags->reject->isBlocked()->pluck('loose_key')->unique()->values();

        if ($keys->isEmpty()) {
            return collect();
        }

        $similar = $this->withUsage(Tag::query()->canonical()->whereNull('tags.blocked_at'))
            ->whereIn('tags.loose_key', $keys)
            ->get();

        $mains = $similar->groupBy('loose_key')
            ->filter(fn (Collection $group) => $group->count() > 1)
            ->map(fn (Collection $group) => $group->sortBy(
                fn (Tag $tag) => [-(int) $tag->getAttribute('articles'), strlen($tag->name)],
            )->first());

        $suggestions = [];

        foreach ($tags as $tag) {
            $main = $mains->get($tag->loose_key);

            if ($main instanceof Tag && ! $tag->isBlocked() && ! $main->is($tag)) {
                $suggestions[$tag->id] = ['id' => $main->id, 'name' => $main->name];
            }
        }

        return collect($suggestions);
    }

    /**
     * Acrescenta quantos artigos usam cada tag, em qualquer versão.
     *
     * @param  Builder<Tag>  $query
     * @return Builder<Tag>
     */
    private function withUsage(Builder $query): Builder
    {
        $usage = DB::table('article_version_tag')
            ->join('article_versions', 'article_versions.id', '=', 'article_version_tag.article_version_id')
            ->select('article_version_tag.tag_id', DB::raw('count(distinct article_versions.article_id) as articles'))
            ->groupBy('article_version_tag.tag_id');

        return $query->leftJoinSub($usage, 'usage', 'usage.tag_id', '=', 'tags.id')
            ->select('tags.*', DB::raw('coalesce(usage.articles, 0) as articles'));
    }
}
