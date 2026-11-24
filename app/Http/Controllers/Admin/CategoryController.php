<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Taxonomy\Actions\DeleteCategory;
use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/** Criar, renomear e excluir categorias (RF-124, RF-126). */
class CategoryController extends Controller
{
    public function store(CategoryRequest $request, RecordAudit $audit): RedirectResponse
    {
        Gate::authorize('create', Category::class);

        DB::transaction(function () use ($request, $audit) {
            $category = Category::query()->create([
                ...$request->validated(),
                'slug' => $this->uniqueSlug($request->validated('name_pt_br')),
            ]);
            $audit->handle($request->user(), AuditAction::CategoryCreated, $category->name_pt_br, $category);
        });

        return $this->done('admin.taxonomy.category.created');
    }

    /** Renomear não muda o slug: os links de filtro continuam funcionando. */
    public function update(CategoryRequest $request, Category $category, RecordAudit $audit): RedirectResponse
    {
        Gate::authorize('update', $category);

        DB::transaction(function () use ($request, $category, $audit) {
            $before = $category->name_pt_br;
            $category->update($request->validated());
            $audit->handle($request->user(), AuditAction::CategoryUpdated, $category->name_pt_br, $category, details: ['before' => $before]);
        });

        return $this->done('admin.taxonomy.category.updated');
    }

    public function destroy(Request $request, Category $category, DeleteCategory $delete, RecordAudit $audit): RedirectResponse
    {
        Gate::authorize('delete', $category);

        $validated = $request->validate([
            'transfer_to' => ['nullable', 'integer', 'exists:categories,id'],
        ]);
        $target = isset($validated['transfer_to']) ? Category::query()->whereKey($validated['transfer_to'])->first() : null;

        try {
            DB::transaction(function () use ($request, $category, $target, $delete, $audit) {
                $delete->handle($category, $target);
                $audit->handle($request->user(), AuditAction::CategoryDeleted, $category->name_pt_br, $category, details: ['transfer_to' => $target?->name_pt_br]);
            });
        } catch (TaxonomyRefused $exception) {
            throw ValidationException::withMessages(['transfer_to' => __($exception->getMessage())]);
        }

        return $this->done('admin.taxonomy.category.deleted');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'categoria';
        $slug = $base;

        for ($i = 2; Category::query()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => __($message)]);

        return to_route('admin.taxonomy');
    }
}
