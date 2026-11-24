<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Rules\ArticleTransitions;
use App\Domain\Articles\Rules\VersionTransitions;
use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Exceptions\DecisionRefused;
use App\Domain\Moderation\Rules\AuditLabel;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\User;
use App\Notifications\Articles\ArticleUnpublished;
use Illuminate\Support\Facades\DB;

/**
 * Despublica (RF-111, RF-348, fluxo 6.5): o artigo volta a não publicado e
 * a versão em vigor passa a rejeitada, com o item e a justificativa. A
 * autora corrige e reenvia pelo fluxo normal. O endereço fica guardado.
 */
class UnpublishArticle
{
    public function __construct(private readonly RecordAudit $audit) {}

    /** @throws DecisionRefused */
    public function handle(Article $article, User $admin, string $policyItem, string $reason): Article
    {
        return DB::transaction(function () use ($article, $admin, $policyItem, $reason) {
            $article = Article::query()->lockForUpdate()->findOrFail($article->id);
            $current = $article->current_version_id === null ? null : ArticleVersion::query()->lockForUpdate()->find($article->current_version_id);

            if ($article->state !== ArticleState::Published || $current === null) {
                throw DecisionRefused::notPublished();
            }

            VersionTransitions::ensure($current->status, VersionStatus::Rejected);
            $current->forceFill([
                'status' => VersionStatus::Rejected,
                'decided_at' => now(),
                'decided_by_id' => $admin->id,
                'decision_reason' => $reason,
                'decision_policy_item' => $policyItem,
            ])->save();

            ArticleTransitions::ensure($article->state, ArticleState::Unpublished);
            $article->forceFill(['state' => ArticleState::Unpublished, 'current_version_id' => null])->save();

            $this->audit->handle($admin, AuditAction::ArticleUnpublished, AuditLabel::article($article, $current->title), $article, $policyItem, $reason);
            $article->author?->notify(new ArticleUnpublished((string) $current->title, $reason, $policyItem));

            return $article;
        });
    }
}
