<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Articles\Actions\AssignSlug;
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
use App\Notifications\Articles\VersionApproved;
use Illuminate\Support\Facades\DB;

/**
 * Aprova a versão da fila (RF-325, RF-346): ela entra em vigor e o artigo
 * fica público, com o endereço fixo da primeira publicação (D83). Numa
 * edição, a versão anterior passa a substituída (RF-330). Se a autora
 * retirou a versão antes, a decisão é recusada (RF-105).
 */
class ApproveVersion
{
    public function __construct(
        private readonly AssignSlug $slugs,
        private readonly RecordAudit $audit,
    ) {}

    /** @throws DecisionRefused */
    public function handle(ArticleVersion $version, User $admin): ArticleVersion
    {
        return DB::transaction(function () use ($version, $admin) {
            $version = ArticleVersion::query()->lockForUpdate()->find($version->id);

            if ($version === null || $version->status !== VersionStatus::Pending) {
                throw DecisionRefused::notPending();
            }

            $article = Article::query()->lockForUpdate()->findOrFail($version->article_id);
            $current = $article->current_version_id === null ? null : ArticleVersion::query()->find($article->current_version_id);
            $edit = $current !== null;

            if ($current !== null) {
                VersionTransitions::ensure($current->status, VersionStatus::Superseded);
                $current->forceFill(['status' => VersionStatus::Superseded])->save();
            }

            VersionTransitions::ensure($version->status, VersionStatus::Approved);
            $version->forceFill([
                'status' => VersionStatus::Approved,
                'decided_at' => now(),
                'decided_by_id' => $admin->id,
                'decision_reason' => null,
                'decision_policy_item' => null,
            ])->save();

            if ($article->state !== ArticleState::Published) {
                ArticleTransitions::ensure($article->state, ArticleState::Published);
            }

            $article->forceFill([
                'state' => ArticleState::Published,
                'current_version_id' => $version->id,
                'first_published_at' => $article->first_published_at ?? now(),
            ])->save();
            $slug = $this->slugs->handle($article, (string) $version->title);

            $this->audit->handle($admin, AuditAction::VersionApproved, AuditLabel::article($article, $version->title), $version, details: ['edit' => $edit]);
            $article->author?->notify(new VersionApproved((string) $version->title, route('articles.show', $slug), $edit));

            return $version;
        });
    }
}
