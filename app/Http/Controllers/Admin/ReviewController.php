<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Moderation\Actions\ApproveVersion;
use App\Domain\Moderation\Actions\RejectVersion;
use App\Domain\Moderation\Exceptions\DecisionRefused;
use App\Domain\Moderation\Queries\ApprovalQueue;
use App\Domain\Moderation\Queries\ContentPolicyItems;
use App\Domain\Moderation\Rules\VersionChecks;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\DecisionRequest;
use App\Http\Resources\Articles\ArticlePage;
use App\Models\ArticleVersion;
use App\Support\Editor\ArticleRenderer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Revisar uma versão (pranchas "Revisar versão" e "Rejeitar"): o retrato
 * congelado com a mesma renderização da leitura, o resumo e a decisão. A
 * administradora não edita, só aprova ou rejeita (RF-109).
 */
class ReviewController extends Controller
{
    public function show(ArticleVersion $version, ArticlePage $page, ApprovalQueue $queue, ContentPolicyItems $items): Response|RedirectResponse
    {
        if ($version->status !== VersionStatus::Pending || $version->article->trashed()) {
            return $this->gone();
        }

        $article = $version->article;
        $checks = VersionChecks::of($version);

        return Inertia::render('admin/review', [
            'version' => [
                'id' => $version->id,
                'submittedAt' => $version->submitted_at?->toIso8601String(),
                'late' => $version->submitted_at?->lt(now()->subHours(ApprovalQueue::LATE_HOURS)) ?? false,
                'edit' => $article->current_version_id !== null,
                'liveUrl' => $article->current_version_id !== null && $article->slug !== null
                    ? route('articles.show', $article->slug, absolute: false)
                    : null,
                'words' => ArticleRenderer::countWords((string) $version->content_text),
                ...$checks,
            ],
            'article' => $page->for($article, $version),
            'policyItems' => $items->all(),
            'queue' => [
                'count' => $queue->count(),
                'previous' => $queue->neighbour($version, next: false)?->id,
                'next' => $queue->neighbour($version, next: true)?->id,
            ],
            'lateHours' => ApprovalQueue::LATE_HOURS,
        ]);
    }

    public function store(DecisionRequest $request, ArticleVersion $version, ApproveVersion $approve, RejectVersion $reject, ApprovalQueue $queue): RedirectResponse
    {
        $next = $queue->neighbour($version, next: true);

        try {
            $request->approves()
                ? $approve->handle($version, $request->user())
                : $reject->handle($version, $request->user(), $request->validated('policy_item'), $request->validated('reason'));
        } catch (DecisionRefused $refused) {
            Inertia::flash('toast', ['type' => 'warning', 'message' => __($refused->getMessage())]);

            return to_route('admin.queue');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __($request->approves() ? 'moderation.approved' : 'moderation.rejected')]);

        // Segue para a próxima da fila, como o "J" da prancha
        return $next === null ? to_route('admin.queue') : to_route('admin.review', $next);
    }

    private function gone(): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'warning', 'message' => __('moderation.refused.not_pending')]);

        return to_route('admin.queue');
    }
}
