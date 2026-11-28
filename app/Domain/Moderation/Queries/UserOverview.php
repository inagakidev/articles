<?php

namespace App\Domain\Moderation\Queries;

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Reports\Enums\ReportStatus;
use App\Domain\Reports\Enums\ReportTarget;
use App\Models\Article;
use App\Models\Comment;
use App\Models\Report;
use App\Models\User;

/**
 * O que a administradora precisa saber de uma conta antes de penalizar
 * (prancha "Admin · Usuário e penalidade"): os números e o que a suspensão
 * esconde.
 */
class UserOverview
{
    /** @return array{published: int, comments: int, pending: int, openReports: int, penalties: int} */
    public function for(User $user): array
    {
        $articles = Article::query()->where('user_id', $user->id);
        $comments = Comment::query()->where('user_id', $user->id);

        return [
            'published' => (clone $articles)->where('state', ArticleState::Published)->count(),
            'comments' => (clone $comments)->count(),
            // Versões na fila, que voltam a rascunho com a suspensão (RF-210)
            'pending' => (clone $articles)->whereHas('versions', fn ($query) => $query->where('status', VersionStatus::Pending))->count(),
            'openReports' => Report::query()
                ->where('status', ReportStatus::Open)
                ->where(fn ($query) => $query
                    ->where(fn ($profile) => $profile->where('target', ReportTarget::Profile)->where('target_id', $user->id))
                    ->orWhere(fn ($article) => $article->where('target', ReportTarget::Article)->whereIn('target_id', (clone $articles)->select('id')))
                    ->orWhere(fn ($comment) => $comment->where('target', ReportTarget::Comment)->whereIn('target_id', (clone $comments)->select('id'))))
                ->count(),
            'penalties' => $user->penalties()->count(),
        ];
    }
}
