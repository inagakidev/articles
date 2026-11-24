<?php

namespace App\Domain\Reports\Actions;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Actions\DeleteArticle;
use App\Domain\Moderation\Actions\ModerateProfile;
use App\Domain\Moderation\Actions\RemoveComment;
use App\Domain\Moderation\Actions\UnpublishArticle;
use App\Domain\Moderation\Rules\AuditLabel;
use App\Domain\Reports\Enums\ReportOutcome;
use App\Domain\Reports\Enums\ReportStatus;
use App\Domain\Reports\Enums\ReportTarget;
use App\Domain\Reports\Exceptions\ReportRefused;
use App\Domain\Reports\Queries\ReportTargets;
use App\Models\Article;
use App\Models\Comment;
use App\Models\Report;
use App\Models\User;
use App\Notifications\Reports\ReportReviewed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use InvalidArgumentException;

/**
 * Decide as denúncias abertas de um item, todas de uma vez (RF-170 a
 * RF-178): procedente, com o desfecho, o item da Política e a
 * justificativa; ou improcedente, com a justificativa. As denúncias são
 * fechadas antes do desfecho, para a exclusão não as marcar como
 * "conteúdo removido". Quem denunciou recebe só o aviso (RF-172).
 */
class DecideReport
{
    public function __construct(
        private readonly ReportTargets $targets,
        private readonly RecordAudit $audit,
        private readonly UnpublishArticle $unpublish,
        private readonly DeleteArticle $deleteArticle,
        private readonly RemoveComment $removeComment,
        private readonly ModerateProfile $moderateProfile,
    ) {}

    /**
     * @param  array{photo?: bool, bio?: bool, username?: bool}  $profile  O que redefinir no perfil
     *
     * @throws ReportRefused
     */
    public function handle(ReportTarget $target, int $id, User $admin, ReportOutcome $outcome, ?string $policyItem, string $justification, array $profile = []): int
    {
        if (! in_array($outcome, ReportOutcome::for($target), true)) {
            throw new InvalidArgumentException("Desfecho {$outcome->value} não vale para {$target->value}.");
        }

        $reporters = DB::transaction(function () use ($target, $id, $admin, $outcome, $policyItem, $justification, $profile) {
            $open = Report::query()
                ->where('status', ReportStatus::Open)
                ->where('target', $target)
                ->where('target_id', $id)
                ->lockForUpdate()
                ->get();
            $item = $this->targets->current($target, $id);

            if ($open->isEmpty() || $item === null) {
                throw ReportRefused::alreadyDecided();
            }

            $dismiss = $outcome === ReportOutcome::Dismiss;
            Report::query()->whereKey($open->modelKeys())->update([
                'status' => $dismiss ? ReportStatus::Dismissed : ReportStatus::Upheld,
                'open' => null,
                'outcome' => $outcome,
                'policy_item' => $dismiss ? null : $policyItem,
                'justification' => $justification,
                'decided_by_id' => $admin->id,
                'decided_at' => now(),
            ]);

            $this->apply($outcome, $item, $admin, (string) $policyItem, $justification, $profile);

            return $open->pluck('reporter_id')->filter()->unique()->all();
        });

        Notification::send(User::query()->whereKey($reporters)->get(), new ReportReviewed);

        return count($reporters);
    }

    /** @param  array{photo?: bool, bio?: bool, username?: bool}  $profile */
    private function apply(ReportOutcome $outcome, Article|Comment|User $item, User $admin, string $policyItem, string $justification, array $profile): void
    {
        match (true) {
            $outcome === ReportOutcome::UnpublishArticle && $item instanceof Article => $this->unpublish->handle($item, $admin, $policyItem, $justification),
            $outcome === ReportOutcome::DeleteArticle && $item instanceof Article => $this->deleteArticle->handle($item, $admin, $policyItem, $justification),
            $outcome === ReportOutcome::DeleteComment && $item instanceof Comment => $this->removeComment->handle($item, $admin, $policyItem, $justification),
            $outcome === ReportOutcome::ModerateProfile && $item instanceof User => $this->moderateProfile->handle(
                $item, $admin, $profile['photo'] ?? false, $profile['bio'] ?? false, $profile['username'] ?? false, $policyItem, $justification,
            ),
            default => $this->audit->handle($admin, AuditAction::ReportDismissed, $this->label($item), $item, null, $justification),
        };
    }

    private function label(Article|Comment|User $item): string
    {
        return match (true) {
            $item instanceof Article => AuditLabel::article($item, $item->currentVersion?->title),
            $item instanceof Comment => AuditLabel::comment($item),
            default => AuditLabel::profile($item),
        };
    }
}
