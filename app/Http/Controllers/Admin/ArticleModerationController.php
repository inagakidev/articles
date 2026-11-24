<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Moderation\Actions\DeleteArticle;
use App\Domain\Moderation\Actions\UnpublishArticle;
use App\Domain\Moderation\Exceptions\DecisionRefused;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerationRequest;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

/**
 * Despublicar e excluir de vez, a partir da leitura do artigo (RF-111,
 * RF-122, D87). As duas pedem o item da Política e a justificativa.
 */
class ArticleModerationController extends Controller
{
    public function unpublish(ModerationRequest $request, Article $article, UnpublishArticle $unpublish): RedirectResponse
    {
        try {
            $unpublish->handle($article, $request->user(), $request->validated('policy_item'), $request->validated('reason'));
        } catch (DecisionRefused $refused) {
            return $this->done($refused->getMessage(), 'warning');
        }

        return $this->done('moderation.unpublished');
    }

    public function destroy(ModerationRequest $request, Article $article, DeleteArticle $delete): RedirectResponse
    {
        $delete->handle($article, $request->user(), $request->validated('policy_item'), $request->validated('reason'));

        return $this->done('moderation.deleted');
    }

    private function done(string $message, string $type = 'success'): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => __($message)]);

        // O artigo saiu do ar: a leitura dele daria 404
        return to_route('articles.index');
    }
}
