<?php

namespace App\Domain\Search\Queries;

/**
 * O que a pessoa pediu na busca (RF-130 a RF-136), já limpo. Tudo é
 * opcional: sem termo, os filtros sozinhos percorrem os artigos visíveis.
 */
final readonly class SearchCriteria
{
    public const PERIODS = ['month', 'semester', 'year'];

    /** "Mais curtidos" é a ordem padrão (RF-132). */
    public const SORTS = ['liked', 'recent', 'oldest'];

    /** Dias em que as curtidas contam para "mais curtidos"; nulo é sempre (RF-134). */
    public const POPULARITY = [7, 30, 90];

    public const DEFAULT_POPULARITY = 30;

    /**
     * @param  list<string>  $tags  Nomes normalizados (`TagName`)
     * @param  self::PERIODS[number]|null  $period  Pela primeira publicação (RF-135)
     * @param  self::SORTS[number]  $sort  Curtidas no período, ou a primeira publicação (RF-132, RF-136)
     * @param  int|null  $popularity  Dias das curtidas contadas; nulo é todo o histórico (RF-134)
     */
    public function __construct(
        public string $text = '',
        public ?string $category = null,
        public ?string $author = null,
        public ?string $language = null,
        public array $tags = [],
        public ?string $period = null,
        public string $sort = 'liked',
        public ?int $popularity = self::DEFAULT_POPULARITY,
    ) {}

    /** Quantos filtros estão ligados, para o "Filtros · N". */
    public function filterCount(): int
    {
        return count(array_filter([$this->category, $this->author, $this->language, $this->period])) + count($this->tags);
    }
}
