<?php

namespace App\Domain\Taxonomy\Exceptions;

use DomainException;

/** Recusa de uma regra de categorias e tags. A mensagem é a chave de tradução. */
class TaxonomyRefused extends DomainException
{
    public static function categoryInUse(): self
    {
        return new self('admin.taxonomy.category.in_use');
    }

    public static function sameCategory(): self
    {
        return new self('admin.taxonomy.category.same');
    }

    public static function sameTag(): self
    {
        return new self('admin.taxonomy.tag.same');
    }

    public static function tagBlocked(string $name): self
    {
        return new self("tag_blocked:{$name}");
    }
}
