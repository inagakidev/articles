<?php

namespace App\Domain\Reports\Queries;

use App\Domain\Articles\Queries\PublicArticles;
use App\Domain\Reports\Enums\ReportTarget;
use App\Models\Article;
use App\Models\Comment;
use App\Models\User;

/**
 * O item de uma denúncia e quem o escreveu. Para denunciar, só o que está
 * à vista do público; a administradora vê o item como estiver agora.
 */
class ReportTargets
{
    public function __construct(private readonly PublicArticles $articles) {}

    /** O item à vista do público, para denunciar. */
    public function visible(ReportTarget $target, int $id): Article|Comment|User|null
    {
        return match ($target) {
            ReportTarget::Article => $this->articles->query()->find($id),
            ReportTarget::Comment => Comment::query()
                ->whereIn('article_id', $this->articles->query()->select('id'))
                ->find($id),
            // Só perfil público: conta com e-mail confirmado
            // Só perfil público: e-mail confirmado e sem penalidade ativa
            ReportTarget::Profile => User::query()->whereNotNull('email_verified_at')->notPenalized()->find($id),
        };
    }

    /** O item como está agora, para a análise (RF-174). */
    public function current(ReportTarget $target, int $id): Article|Comment|User|null
    {
        return match ($target) {
            ReportTarget::Article => Article::query()->withTrashed()->find($id),
            ReportTarget::Comment => Comment::query()->find($id),
            ReportTarget::Profile => User::query()->find($id),
        };
    }

    /** Quem escreveu o item (no perfil, a própria pessoa). */
    public function ownerId(Article|Comment|User $item): int
    {
        return $item instanceof User ? $item->id : $item->user_id;
    }
}
