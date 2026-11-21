<?php

namespace App\Domain\Taxonomy\Actions;

use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Domain\Taxonomy\Rules\TagName;
use App\Models\Tag;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Collection;

/**
 * Transforma o que o autor digitou em tags (RF-127, RF-128): normaliza,
 * junta repetidas, segue os apelidos e cria as que faltam. Tag bloqueada
 * é recusada (RF-129). É o que o editor usa ao salvar (fatia 8).
 */
class ResolveTags
{
    /**
     * @param  list<string>  $names
     * @return Collection<int, Tag>
     *
     * @throws TaxonomyRefused
     */
    public function handle(array $names): Collection
    {
        return collect($names)
            ->map(fn (string $name) => TagName::normalize($name))
            ->filter()
            ->unique()
            ->map(fn (string $name) => $this->resolve($name))
            ->unique('id')
            ->values();
    }

    private function resolve(string $name): Tag
    {
        try {
            $tag = Tag::query()->firstOrCreate(['name' => $name]);
        } catch (UniqueConstraintViolationException) {
            // Outra pessoa criou a mesma tag no mesmo instante.
            $tag = Tag::query()->where('name', $name)->firstOrFail();
        }

        if ($tag->merged_into_id !== null) {
            $tag = Tag::query()->findOrFail($tag->merged_into_id);
        }

        if ($tag->isBlocked()) {
            throw TaxonomyRefused::tagBlocked($tag->name);
        }

        return $tag;
    }
}
