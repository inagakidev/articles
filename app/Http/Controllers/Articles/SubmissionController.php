<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Actions\SubmitDraft;
use App\Domain\Articles\Actions\WithdrawPending;
use App\Domain\Articles\Exceptions\SubmissionRefused;
use App\Domain\Articles\Exceptions\WithdrawalNeedsChoice;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Enviar para a revisão e retirar da fila (RF-303, RF-344, RF-345).
 * O autor volta para Meus artigos, onde vê a estimativa de revisão (RF-377).
 */
class SubmissionController extends Controller
{
    public function store(Article $article, SubmitDraft $submit): RedirectResponse
    {
        Gate::authorize('update', $article);

        try {
            $version = $submit->handle($article);
        } catch (SubmissionRefused $exception) {
            throw ValidationException::withMessages(
                collect($exception->missing)
                    ->mapWithKeys(fn (string $item) => [$item => __('submission.refused.'.$item)])
                    ->all(),
            );
        }

        Inertia::flash('submitted', ['articleId' => $article->id, 'title' => $version->title]);

        return to_route('articles.mine');
    }

    public function destroy(Request $request, Article $article, WithdrawPending $withdraw): RedirectResponse
    {
        Gate::authorize('update', $article);

        $keep = $request->validate([
            'keep' => ['nullable', Rule::in([WithdrawPending::KEEP_DRAFT, WithdrawPending::KEEP_PENDING])],
        ])['keep'] ?? null;

        try {
            $withdraw->handle($article, $keep);
        } catch (WithdrawalNeedsChoice) {
            throw ValidationException::withMessages(['keep' => __('submission.withdraw.choose')]);
        }

        return back();
    }
}
