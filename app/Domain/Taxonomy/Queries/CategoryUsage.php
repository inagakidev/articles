<?php

namespace App\Domain\Taxonomy\Queries;

use App\Models\Category;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/** Quantos artigos usam cada categoria, em qualquer versão (RF-126). */
class CategoryUsage
{
    /** @return Collection<int, int> id da categoria => artigos */
    public function counts(): Collection
    {
        return DB::table('article_versions')
            ->whereNotNull('category_id')
            ->groupBy('category_id')
            ->pluck(DB::raw('count(distinct article_id)'), 'category_id')
            ->map(fn ($count) => (int) $count);
    }

    public function of(Category $category): int
    {
        return (int) $category->versions()->distinct()->count('article_id');
    }
}
