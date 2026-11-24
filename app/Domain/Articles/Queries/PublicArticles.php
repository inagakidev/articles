<?php

namespace App\Domain\Articles\Queries;

use App\Domain\Articles\Enums\ArticleState;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A regra única de visibilidade pública (REQUIREMENTS §5.3, p5-01):
 * publicado, fora da lixeira, com versão em vigor e endereço. Listagem,
 * leitura, apresentação e imagens partem de `query()`; a busca e o perfil
 * também vão partir. A situação do autor (suspenso ou banido, RF-353) entra
 * aqui com as penalidades (fatia 21).
 */
class PublicArticles
{
    /** Cartões por página na listagem (RF-133). */
    public const PER_PAGE = 12;

    /** @return Builder<Article> */
    public function query(): Builder
    {
        // A lixeira já fica de fora pelo escopo do SoftDeletes.
        return Article::query()
            ->where('state', ArticleState::Published)
            ->whereNotNull('current_version_id')
            ->whereNotNull('slug');
    }

    /**
     * Do mais novo para o mais antigo, pela primeira publicação (RF-136).
     *
     * @return LengthAwarePaginator<int, Article>
     */
    public function paginate(?Category $category = null): LengthAwarePaginator
    {
        return $this->summaries()
            ->when($category, fn (Builder $query, Category $category) => $query
                ->whereHas('currentVersion', fn (Builder $version) => $version->where('category_id', $category->id)))
            ->paginate(self::PER_PAGE)
            ->withQueryString();
    }

    /** @return Collection<int, Article> */
    public function recent(int $limit): Collection
    {
        return $this->summaries()->limit($limit)->get();
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
     * de leitura saem do texto puro.
     *
     * @return Builder<Article>
     */
    private function summaries(): Builder
    {
        return $this->query()
            ->with([
                'author',
                'currentVersion' => fn (BelongsTo $version) => $version->select(['id', 'article_id', 'title', 'content_text', 'category_id', 'cover_image_id', 'decided_at']),
                'currentVersion.category',
                'currentVersion.coverImage',
            ])
            ->orderByDesc('first_published_at')
            ->orderByDesc('id');
    }
}
