<?php

namespace App\Domain\Taxonomy\Actions;

use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

/**
 * Exclui uma categoria (RF-126): se algum artigo a usa, em qualquer versão,
 * todas essas versões passam para a categoria escolhida na mesma transação.
 */
class DeleteCategory
{
    public function handle(Category $category, ?Category $transferTo = null): void
    {
        if ($transferTo?->is($category)) {
            throw TaxonomyRefused::sameCategory();
        }

        DB::transaction(function () use ($category, $transferTo) {
            $versions = $category->versions()->lockForUpdate();

            if ($versions->exists()) {
                if ($transferTo === null) {
                    throw TaxonomyRefused::categoryInUse();
                }

                $versions->update(['category_id' => $transferTo->id]);
            }

            $category->delete();
        });
    }
}
