<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Taxonomy\Enums\CategoryColor;
use App\Domain\Taxonomy\Queries\CategoryUsage;
use App\Domain\Taxonomy\Queries\TagIndex;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/** "Categorias e tags" no painel (prancha "Admin · Categorias e tags", RF-251). */
class TaxonomyController extends Controller
{
    public function __invoke(Request $request, CategoryUsage $usage, TagIndex $tags): Response
    {
        Gate::authorize('viewAny', Category::class);
        Gate::authorize('viewAny', Tag::class);

        $counts = $usage->counts();
        $search = $request->string('tag')->trim()->value();

        return Inertia::render('admin/taxonomy', [
            'categories' => Category::query()->orderBy('name_pt_br')->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'namePtBr' => $category->name_pt_br,
                    'nameEn' => $category->name_en,
                    'color' => $category->color->value,
                    'articles' => $counts->get($category->id, 0),
                ]),
            'colors' => array_column(CategoryColor::cases(), 'value'),
            'tags' => $tags->page($search, $request->integer('page', 1)),
            'search' => $search,
        ]);
    }
}
