<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Queries\WorkingVersion;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Lixeira do autor (RF-116 a RF-119, RF-340, RF-341): sem "Tem certeza?",
 * porque a restauração vale por sete dias e o aviso traz "Desfazer". A
 * exclusão definitiva é feita pelo `model:prune` (`Article::prunable`).
 */
class TrashController extends Controller
{
    public function index(Request $request, WorkingVersion $working): Response
    {
        $articles = Article::onlyTrashed()
            ->where('user_id', $request->user()->id)
            ->latest('deleted_at')
            ->get()
            ->map(fn (Article $article) => [
                'id' => $article->id,
                'title' => $working->for($article)?->title,
                'deletedAt' => $article->deleted_at?->toIso8601String(),
                'restorableUntil' => $article->restorableUntil()?->toIso8601String(),
            ]);

        return Inertia::render('my-articles/trash', [
            'articles' => $articles,
            'trashDays' => Article::TRASH_DAYS,
        ]);
    }

    public function store(Article $article): RedirectResponse
    {
        Gate::authorize('delete', $article);

        $article->delete();

        return back();
    }

    public function destroy(Article $article): RedirectResponse
    {
        Gate::authorize('restore', $article);

        $article->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('trash.restored')]);

        return back();
    }
}
