<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Taxonomy\Actions\MergeTags;
use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/** Bloquear, desbloquear, unir e excluir tags (RF-128, RF-129). */
class TagController extends Controller
{
    /** Bloqueada, a tag não pode ser usada em artigos novos nem em edições. */
    public function block(Tag $tag): RedirectResponse
    {
        Gate::authorize('update', $tag);

        $tag->forceFill(['blocked_at' => now()])->save();

        return $this->done('admin.taxonomy.tag.blocked');
    }

    public function unblock(Tag $tag): RedirectResponse
    {
        Gate::authorize('update', $tag);

        $tag->forceFill(['blocked_at' => null])->save();

        return $this->done('admin.taxonomy.tag.unblocked');
    }

    public function merge(Request $request, Tag $tag, MergeTags $merge): RedirectResponse
    {
        Gate::authorize('update', $tag);

        $validated = $request->validate(['target_id' => ['required', 'integer', 'exists:tags,id']]);

        try {
            $merge->handle($tag, Tag::query()->whereKey($validated['target_id'])->firstOrFail());
        } catch (TaxonomyRefused $exception) {
            throw ValidationException::withMessages(['target_id' => __($exception->getMessage())]);
        }

        return $this->done('admin.taxonomy.tag.merged');
    }

    /** Excluir tira a tag de todas as versões (RF-129). */
    public function destroy(Tag $tag): RedirectResponse
    {
        Gate::authorize('delete', $tag);

        $tag->delete();

        return $this->done('admin.taxonomy.tag.deleted');
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => __($message)]);

        return back();
    }
}
