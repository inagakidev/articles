<?php

namespace App\Domain\Search\Queries;

/**
 * O que a pessoa pediu na busca (RF-130 a RF-136), já limpo. Tudo é
 * opcional: sem termo, os filtros sozinhos percorrem os artigos visíveis.
 */
final readonly class SearchCriteria
{
    public const PERIODS = ['month', 'semester', 'year'];

    public const SORTS = ['recent', 'oldest'];

    /**
     * @param  list<string>  $tags  Nomes normalizados (`TagName`)
     * @param  self::PERIODS[number]|null  $period  Pela primeira publicação (RF-135)
     * @param  self::SORTS[number]  $sort  Pela primeira publicação (RF-136)
     */
    public function __construct(
        public string $text = '',
        public ?string $category = null,
        public ?string $author = null,
        public ?string $language = null,
        public array $tags = [],
        public ?string $period = null,
        public string $sort = 'recent',
    ) {}

    /** Quantos filtros estão ligados, para o "Filtros · N". */
    public function filterCount(): int
    {
        return count(array_filter([$this->category, $this->author, $this->language, $this->period])) + count($this->tags);
    }
}
