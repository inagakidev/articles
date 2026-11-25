<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Moderation\Enums\AppealStatus;
use App\Domain\Moderation\Queries\ApprovalQueue;
use App\Domain\Reports\Queries\ReportQueue;
use App\Http\Controllers\Controller;
use App\Models\Appeal;
use App\Models\ArticleVersion;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Painel da administração (RF-262): usuários, artigos publicados e a fila,
 * com as versões atrasadas em "Precisa da sua atenção" (RF-378). Denúncias
 * e contestações entram com as fatias 20 e 21.
 */
class DashboardController extends Controller
{
    /** Avisos de atraso mostrados no painel. */
    public const ATTENTION = 5;

    public function __invoke(ApprovalQueue $queue, PublicArticles $articles, ReportQueue $reports): Response
    {
        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'users' => User::query()->count(),
                'published' => $articles->query()->count(),
                'pending' => $queue->count(),
                // Itens com denúncia aberta (RF-262)
                'reports' => $reports->openCount(),
                'appeals' => Appeal::query()->where('status', AppealStatus::Open)->count(),
            ],
            'attention' => $queue->late(self::ATTENTION)->map(fn (ArticleVersion $version) => [
                'type' => 'late_version',
                'id' => $version->id,
                'title' => $version->title,
                'author' => $version->article->author?->username,
                'hours' => (int) floor(($version->submitted_at?->diffInMinutes(now(), true) ?? 0) / 60),
            ]),
            'lateHours' => ApprovalQueue::LATE_HOURS,
            'updatedAt' => now()->toIso8601String(),
        ]);
    }
}
