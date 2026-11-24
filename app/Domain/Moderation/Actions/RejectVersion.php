<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Rules\VersionTransitions;
use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Exceptions\DecisionRefused;
use App\Domain\Moderation\Rules\AuditLabel;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\User;
use App\Notifications\Articles\VersionRejected;
use Illuminate\Support\Facades\DB;

/**
 * Rejeita a versão da fila com o item da Política e a justificativa
 * (RF-107, RF-347). A versão publicada, se houver, continua no ar
 * (RF-110). Se a autora retirou a versão antes, a decisão é recusada.
 */
class RejectVersion
{
    public function __construct(private readonly RecordAudit $audit) {}

    /** @throws DecisionRefused */
    public function handle(ArticleVersion $version, User $admin, string $policyItem, string $reason): ArticleVersion
    {
        return DB::transaction(function () use ($version, $admin, $policyItem, $reason) {
            $version = ArticleVersion::query()->lockForUpdate()->find($version->id);

            if ($version === null || $version->status !== VersionStatus::Pending) {
                throw DecisionRefused::notPending();
            }

            VersionTransitions::ensure($version->status, VersionStatus::Rejected);
            $version->forceFill([
                'status' => VersionStatus::Rejected,
                'decided_at' => now(),
                'decided_by_id' => $admin->id,
                'decision_reason' => $reason,
                'decision_policy_item' => $policyItem,
            ])->save();

            $article = Article::query()->findOrFail($version->article_id);
            $article->touch();
            $edit = $article->current_version_id !== null;

            $this->audit->handle($admin, AuditAction::VersionRejected, AuditLabel::article($article, $version->title), $version, $policyItem, $reason, ['edit' => $edit]);
            $article->author?->notify(new VersionRejected((string) $version->title, $reason, $policyItem, $edit));

            return $version;
        });
    }
}
