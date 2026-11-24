<?php

namespace App\Http\Requests\Articles;

use App\Domain\Search\Queries\SearchCriteria;
use App\Domain\Taxonomy\Rules\TagName;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Os parâmetros da busca vêm do endereço, que qualquer pessoa pode editar
 * ou compartilhar. Em vez de recusar, o que não faz sentido é ignorado.
 */
class SearchRequest extends FormRequest
{
    /** Tags que dá para combinar de uma vez. */
    public const MAX_TAGS = 5;

    /** Valores do endereço → valores do domínio. */
    private const PERIODS = ['mes' => 'month', 'semestre' => 'semester', 'ano' => 'year'];

    private const SORTS = ['recentes' => 'recent', 'antigos' => 'oldest'];

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [];
    }

    public function criteria(): SearchCriteria
    {
        $tags = array_values(collect((array) $this->query('tags', []))
            ->filter(fn ($tag) => is_string($tag))
            ->map(fn (string $tag) => TagName::normalize($tag))
            ->filter()
            ->unique()
            ->take(self::MAX_TAGS)
            ->all());

        return new SearchCriteria(
            text: mb_substr(trim($this->text('q')), 0, 100),
            category: $this->text('categoria') ?: null,
            author: mb_substr(trim($this->text('autor')), 0, 60) ?: null,
            language: in_array($this->text('idioma'), config('app.locales'), true) ? $this->text('idioma') : null,
            tags: $tags,
            period: self::PERIODS[$this->text('periodo')] ?? null,
            sort: self::SORTS[$this->text('ordem')] ?? 'recent',
        );
    }

    /**
     * Os critérios de volta no formato do endereço, para a página
     * preencher os campos.
     *
     * @return array{q: string, categoria: ?string, autor: ?string, idioma: ?string, tags: list<string>, periodo: ?string, ordem: string}
     */
    public static function toQuery(SearchCriteria $criteria): array
    {
        $period = array_search($criteria->period, self::PERIODS, true);

        return [
            'q' => $criteria->text,
            'categoria' => $criteria->category,
            'autor' => $criteria->author,
            'idioma' => $criteria->language,
            'tags' => $criteria->tags,
            'periodo' => $period === false ? null : $period,
            'ordem' => (string) array_search($criteria->sort, self::SORTS, true),
        ];
    }

    private function text(string $key): string
    {
        $value = $this->query($key);

        return is_string($value) ? $value : '';
    }
}
