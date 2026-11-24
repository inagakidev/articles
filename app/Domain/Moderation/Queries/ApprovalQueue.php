<?php

namespace App\Domain\Moderation\Queries;

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\ArticleVersion;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * A fila de aprovação (RF-249, RF-378): versões pendentes de artigos fora
 * da lixeira, as que esperam há mais tempo primeiro. Novas são de artigos
 * nunca publicados; edições, de artigos com versão em vigor.
 */
class ApprovalQueue
{
    public const PER_PAGE = 20;

    /** Horas até a versão ser marcada como atrasada (RF-378). */
    public const LATE_HOURS = 6;

    public const TYPES = ['new', 'edit'];

    /** @return LengthAwarePaginator<int, ArticleVersion> */
    public function paginate(?string $search = null, ?string $type = null): LengthAwarePaginator
    {
        return $this->query()
            ->with(['article.author', 'category'])
            ->when($type === 'new', fn (Builder $query) => $query->whereHas('article', fn (Builder $article) => $article->whereNull('current_version_id')))
            ->when($type === 'edit', fn (Builder $query) => $query->whereHas('article', fn (Builder $article) => $article->whereNotNull('current_version_id')))
            ->when($search, function (Builder $query, string $search) {
                $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search).'%';
                $query->where(fn (Builder $match) => $match
                    ->where('title', 'like', $like)
                    ->orWhereHas('article.author', fn (Builder $author) => $author->where('name', 'like', $like)->orWhere('username', 'like', $like)));
            })
            ->paginate(self::PER_PAGE)
            ->withQueryString();
    }

    public function count(): int
    {
        return $this->query()->count();
    }

    /**
     * As que passaram do prazo, para "Precisa da sua atenção".
     *
     * @return Collection<int, ArticleVersion>
     */
    public function late(int $limit): Collection
    {
        return $this->query()
            ->with('article.author')
            ->where('submitted_at', '<', now()->subHours(self::LATE_HOURS))
            ->limit($limit)
            ->get();
    }

    /** A vizinha na fila, para as teclas J e K da revisão. */
    public function neighbour(ArticleVersion $version, bool $next): ?ArticleVersion
    {
        // Retirada da fila, a versão não tem mais lugar nela
        if ($version->submitted_at === null) {
            return null;
        }

        return $this->query()
            ->where(fn (Builder $query) => $next
                ? $query->where('submitted_at', '>', $version->submitted_at)->orWhere(fn (Builder $tie) => $tie->where('submitted_at', $version->submitted_at)->where('id', '>', $version->id))
                : $query->where('submitted_at', '<', $version->submitted_at)->orWhere(fn (Builder $tie) => $tie->where('submitted_at', $version->submitted_at)->where('id', '<', $version->id)))
            ->reorder()
            ->orderBy('submitted_at', $next ? 'asc' : 'desc')
            ->orderBy('id', $next ? 'asc' : 'desc')
            ->first(['id']);
    }

    /** @return Builder<ArticleVersion> */
    private function query(): Builder
    {
        return ArticleVersion::query()
            ->where('status', VersionStatus::Pending)
            // A lixeira já tira da fila (RF-123); o filtro protege dados antigos.
            // A relação inclui a lixeira, então o filtro é explícito.
            ->whereHas('article', fn (Builder $article) => $article->whereNull('articles.deleted_at'))
            ->orderBy('submitted_at')
            ->orderBy('id');
    }
}
