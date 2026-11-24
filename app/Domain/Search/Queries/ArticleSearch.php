<?php

namespace App\Domain\Search\Queries;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Taxonomy\Rules\TagName;
use App\Models\Article;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * A busca (RF-130 a RF-136, D54, D85): o único lugar que monta a consulta
 * de texto, sempre a partir da regra única de visibilidade.
 *
 * Cada termo precisa aparecer em algum lugar: título ou texto (FULLTEXT),
 * nome do autor, categoria ou tag. O FULLTEXT do MariaDB ignora termos com
 * menos de 3 letras; esses ("Go", "JS", "C#") procuram a palavra inteira no
 * título, a categoria e a tag de mesmo nome.
 */
class ArticleSearch
{
    public const PER_PAGE = 12;

    /** Tamanho mínimo que o FULLTEXT indexa (`innodb_ft_min_token_size`). */
    public const MIN_INDEXED = 3;

    /**
     * Palavras que não ajudam a achar nada. As em inglês estão na lista de
     * palavras ignoradas do InnoDB: sozinhas, nunca dariam resultado.
     */
    private const IGNORED = [
        'a', 'o', 'e', 'as', 'os', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos',
        'por', 'para', 'com', 'sem', 'que', 'como', 'se', 'ao', 'aos', 'ou', 'mais', 'sobre', 'entre',
        'é', 'são', 'ser', 'foi', 'tem', 'não', 'nao', 'mas', 'pelo', 'pela', 'qual', 'quais', 'isso', 'este',
        'esta', 'esse', 'essa', 'meu', 'minha', 'seu', 'sua',
        'an', 'and', 'the', 'of', 'to', 'in', 'on', 'at', 'by', 'is', 'it', 'or', 'be', 'are', 'as', 'for', 'from',
        'how', 'that', 'this', 'was', 'what', 'when', 'where', 'who', 'will', 'with', 'about', 'und', 'www', 'la', 'en',
    ];

    public function __construct(private readonly PublicArticles $articles) {}

    /** @return LengthAwarePaginator<int, Article> */
    public function paginate(SearchCriteria $criteria): LengthAwarePaginator
    {
        $query = $this->articles->withSummary($this->filtered($criteria));

        match ($criteria->sort) {
            'oldest' => $query->orderBy('first_published_at')->orderBy('id'),
            'recent' => $query->orderByDesc('first_published_at')->orderByDesc('id'),
            // As curtidas do período; no empate, a mais nova (RF-132, RF-134)
            default => $query
                ->withCount(['likes as popularity' => fn (Builder $likes) => $likes
                    ->when($criteria->popularity, fn (Builder $recent, int $days) => $recent->where('created_at', '>=', now()->subDays($days)))])
                ->orderByDesc('popularity')
                ->orderByDesc('first_published_at')
                ->orderByDesc('id'),
        };

        return $query->paginate(self::PER_PAGE)->withQueryString();
    }

    /** @return Builder<Article> */
    public function filtered(SearchCriteria $criteria): Builder
    {
        $query = $this->articles->query();
        $terms = self::terms($criteria->text);

        foreach ($terms['long'] as $term) {
            $query->where(fn (Builder $match) => $this->matchLong($match, $term));
        }

        foreach ($terms['short'] as $term) {
            $query->where(fn (Builder $match) => $this->matchShort($match, $term));
        }

        if ($criteria->category !== null) {
            $query->whereHas('currentVersion.category', fn (Builder $category) => $category->where('slug', $criteria->category));
        }

        if ($criteria->language !== null) {
            $query->whereHas('currentVersion', fn (Builder $version) => $version->where('language', $criteria->language));
        }

        if ($criteria->author !== null) {
            $author = self::escapeLike(ltrim($criteria->author, '@'));
            $query->whereHas('author', fn (Builder $user) => $user
                ->where('name', 'like', "%{$author}%")
                ->orWhere('username', 'like', "{$author}%"));
        }

        foreach ($criteria->tags as $tag) {
            $query->whereHas('currentVersion.tags', fn (Builder $tags) => $tags->where('name', $tag));
        }

        if ($criteria->period !== null) {
            $query->where('first_published_at', '>=', match ($criteria->period) {
                'month' => now()->subMonth(),
                'semester' => now()->subMonths(6),
                default => now()->subYear(),
            });
        }

        return $query;
    }

    /**
     * Os termos da busca, separados entre os que o FULLTEXT indexa e os
     * curtos, sem as palavras que não ajudam.
     *
     * @return array{long: list<string>, short: list<string>}
     */
    public static function terms(string $text): array
    {
        $long = [];
        $short = [];

        foreach (preg_split('/\s+/u', mb_strtolower(trim($text)), flags: PREG_SPLIT_NO_EMPTY) ?: [] as $word) {
            // "c#", "go", "ui": curto como veio, com os sinais
            $compact = (string) preg_replace('/[^\p{L}\p{N}+#.]/u', '', $word);
            $compact = trim($compact, '.');

            if (mb_strlen($compact) > 0 && mb_strlen($compact) < self::MIN_INDEXED) {
                if (mb_strlen($compact) > 1 && ! in_array($compact, self::IGNORED, true)) {
                    $short[] = $compact;
                }

                continue;
            }

            // O FULLTEXT quebra nas pontuações; só as partes que ele indexa
            foreach (preg_split('/[^\p{L}\p{N}_]+/u', $word, flags: PREG_SPLIT_NO_EMPTY) ?: [] as $part) {
                if (mb_strlen($part) >= self::MIN_INDEXED && ! in_array($part, self::IGNORED, true)) {
                    $long[] = $part;
                }
            }
        }

        return ['long' => array_values(array_unique($long)), 'short' => array_values(array_unique($short))];
    }

    /** @param  Builder<Article>  $query */
    private function matchLong(Builder $query, string $term): void
    {
        $like = self::escapeLike($term);

        $query
            // Prefixo: "fila" acha "filas"
            ->whereHas('currentVersion', fn (Builder $version) => $version->whereFullText(['title', 'content_text'], $term.'*', ['mode' => 'boolean']))
            ->orWhereHas('author', fn (Builder $user) => $user->where('name', 'like', "%{$like}%")->orWhere('username', 'like', "{$like}%"))
            ->orWhereHas('currentVersion.category', fn (Builder $category) => $category->where('name_pt_br', 'like', "%{$like}%")->orWhere('name_en', 'like', "%{$like}%"))
            ->orWhereHas('currentVersion.tags', fn (Builder $tags) => $tags->where('name', 'like', self::escapeLike(TagName::normalize($term)).'%'));
    }

    /** @param  Builder<Article>  $query */
    private function matchShort(Builder $query, string $term): void
    {
        // A palavra inteira, sem pegar "go" dentro de "algoritmo"
        $word = '(?i)(^|[^[:alnum:]])'.preg_quote($term, null).'([^[:alnum:]]|$)';

        $query
            ->whereHas('currentVersion', fn (Builder $version) => $version->where('title', 'regexp', $word))
            ->orWhereHas('currentVersion.category', fn (Builder $category) => $category->where('name_pt_br', 'regexp', $word)->orWhere('name_en', 'regexp', $word))
            ->orWhereHas('currentVersion.tags', fn (Builder $tags) => $tags->where('name', TagName::normalize($term)));
    }

    private static function escapeLike(string $value): string
    {
        return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $value);
    }
}
