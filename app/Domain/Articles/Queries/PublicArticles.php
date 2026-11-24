<?php

namespace App\Domain\Articles\Queries;

use App\Domain\Articles\Enums\ArticleState;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A regra única de visibilidade pública (REQUIREMENTS §5.3, p5-01):
 * publicado, fora da lixeira, com versão em vigor e endereço. Listagem,
 * busca, leitura, apresentação e imagens partem de `query()`; o perfil
 * também vai partir. A situação do autor (suspenso ou banido, RF-353) entra
 * aqui com as penalidades (fatia 21).
 */
class PublicArticles
{
    /** @return Builder<Article> */
    public function query(): Builder
    {
        // A lixeira já fica de fora pelo escopo do SoftDeletes.
        return Article::query()
            ->where('state', ArticleState::Published)
            ->whereNotNull('current_version_id')
            ->whereNotNull('slug');
    }

    /** @return Collection<int, Article> */
    public function recent(int $limit, ?Category $category = null): Collection
    {
        return $this->summaries()
            ->when($category, fn (Builder $query, Category $category) => $query
                ->whereHas('currentVersion', fn (Builder $version) => $version->where('category_id', $category->id)))
            ->limit($limit)
            ->get();
    }

    public function findBySlug(string $slug): ?Article
    {
        return $this->query()->where('slug', $slug)->with(['author', 'currentVersion'])->first();
    }

    /**
     * Quem publicou no mês, para a comunidade da apresentação (RF-382).
     *
     * @return array{count: int, people: Collection<int, User>}
     */
    public function authorsOfTheMonth(int $limit): array
    {
        $authors = User::query()->whereIn('id', $this->query()
            ->where('first_published_at', '>=', now()->startOfMonth())
            ->select('user_id'));

        return [
            'count' => (clone $authors)->count(),
            'people' => $authors->orderBy('name')->limit($limit)->get(),
        ];
    }

    /**
     * O que o cartão precisa, sem o documento do editor: o resumo e o tempo
     * de leitura saem do texto puro. A busca usa o mesmo formato.
     *
     * @param  Builder<Article>  $query
     * @return Builder<Article>
     */
    public function withSummary(Builder $query): Builder
    {
        return $query->with([
            'author',
            'currentVersion' => fn (BelongsTo $version) => $version->select(['id', 'article_id', 'title', 'content_text', 'category_id', 'cover_image_id', 'decided_at']),
            'currentVersion.category',
            'currentVersion.coverImage',
        ]);
    }

    /** @return Builder<Article> */
    private function summaries(): Builder
    {
        return $this->withSummary($this->query())
            ->orderByDesc('first_published_at')
            ->orderByDesc('id');
    }
}
