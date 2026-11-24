<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Moderation\Queries\ApprovalQueue;
use App\Http\Controllers\Controller;
use App\Models\ArticleVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Fila de aprovação (prancha "Fila de aprovação", RF-249, RF-378). */
class ApprovalQueueController extends Controller
{
    public function __invoke(Request $request, ApprovalQueue $queue): Response
    {
        $search = trim((string) $request->query('q', '')) ?: null;
        $type = in_array($request->query('tipo'), ApprovalQueue::TYPES, true) ? (string) $request->query('tipo') : null;
        $page = $queue->paginate($search, $type);
        $late = now()->subHours(ApprovalQueue::LATE_HOURS);

        return Inertia::render('admin/queue', [
            'versions' => [
                'data' => collect($page->items())->map(fn (ArticleVersion $version) => [
                    'id' => $version->id,
                    'title' => $version->title,
                    'author' => [
                        'name' => $version->article->author->name ?? __('article.removed_author'),
                        'username' => $version->article->author?->username,
                        'avatar' => $version->article->author?->avatar,
                    ],
                    'type' => $version->article->current_version_id === null ? 'new' : 'edit',
                    'category' => $version->category?->name(),
                    'submittedAt' => $version->submitted_at?->toIso8601String(),
                    'late' => $version->submitted_at !== null && $version->submitted_at->lt($late),
                ]),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
                'from' => $page->firstItem(),
                'to' => $page->lastItem(),
            ],
            'filters' => ['q' => $search, 'tipo' => $type],
            'lateHours' => ApprovalQueue::LATE_HOURS,
        ]);
    }
}
