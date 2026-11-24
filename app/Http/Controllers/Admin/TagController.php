<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Taxonomy\Actions\MergeTags;
use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/** Bloquear, desbloquear, unir e excluir tags (RF-128, RF-129). */
class TagController extends Controller
{
    /** Bloqueada, a tag não pode ser usada em artigos novos nem em edições. */
    public function block(Request $request, Tag $tag, RecordAudit $audit): RedirectResponse
    {
        Gate::authorize('update', $tag);

        DB::transaction(function () use ($request, $tag, $audit) {
            $tag->forceFill(['blocked_at' => now()])->save();
            $audit->handle($request->user(), AuditAction::TagBlocked, "#{$tag->name}", $tag);
        });

        return $this->done('admin.taxonomy.tag.blocked');
    }

    public function unblock(Request $request, Tag $tag, RecordAudit $audit): RedirectResponse
    {
        Gate::authorize('update', $tag);

        DB::transaction(function () use ($request, $tag, $audit) {
            $tag->forceFill(['blocked_at' => null])->save();
            $audit->handle($request->user(), AuditAction::TagUnblocked, "#{$tag->name}", $tag);
        });

        return $this->done('admin.taxonomy.tag.unblocked');
    }

    public function merge(Request $request, Tag $tag, MergeTags $merge, RecordAudit $audit): RedirectResponse
    {
        Gate::authorize('update', $tag);

        $validated = $request->validate(['target_id' => ['required', 'integer', 'exists:tags,id']]);

        $target = Tag::query()->whereKey($validated['target_id'])->firstOrFail();

        try {
            DB::transaction(function () use ($request, $tag, $target, $merge, $audit) {
                $merge->handle($tag, $target);
                $audit->handle($request->user(), AuditAction::TagMerged, "#{$tag->name} → #{$target->name}", $target);
            });
        } catch (TaxonomyRefused $exception) {
            throw ValidationException::withMessages(['target_id' => __($exception->getMessage())]);
        }

        return $this->done('admin.taxonomy.tag.merged');
    }

    /** Excluir tira a tag de todas as versões (RF-129). */
    public function destroy(Request $request, Tag $tag, RecordAudit $audit): RedirectResponse
    {
        Gate::authorize('delete', $tag);

        DB::transaction(function () use ($request, $tag, $audit) {
            $audit->handle($request->user(), AuditAction::TagDeleted, "#{$tag->name}", $tag);
            $tag->delete();
        });

        return $this->done('admin.taxonomy.tag.deleted');
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => __($message)]);

        return back();
    }
}
