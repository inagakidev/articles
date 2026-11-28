<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Enums\PenaltyType;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Domain\Moderation\Rules\PenaltyLabel;
use App\Domain\Moderation\Rules\PenaltyRules;
use App\Models\Penalty;
use App\Models\User;
use App\Notifications\Moderation\AccountBanned;
use Illuminate\Support\Facades\DB;

/**
 * Reabre por mais 7 dias o prazo de contestar um banimento que venceu sem
 * pedido (RF-234), só enquanto conta e perfil estão retidos. Não é uma
 * segunda revisão: contestação já decidida não volta (RF-233). A pessoa
 * recebe de novo o e-mail, com o link novo.
 */
class ReopenAppealDeadline
{
    public function __construct(private readonly RecordAudit $audit) {}

    /** @throws PenaltyRefused */
    public function handle(Penalty $penalty, User $admin, ?string $reason = null): void
    {
        DB::transaction(function () use ($penalty, $admin, $reason) {
            $penalty = Penalty::query()->lockForUpdate()->findOrFail($penalty->id);
            $user = $penalty->user;

            $retained = $penalty->type === PenaltyType::Ban && $penalty->ended_at === null && $user->isBanned();
            $expired = $penalty->appeal_deadline_at === null || $penalty->appeal_deadline_at->isPast();

            if (! $retained || ! $expired || $penalty->appeal()->exists()) {
                throw PenaltyRefused::notReopenable();
            }

            $penalty->forceFill(['appeal_deadline_at' => now()->addDays(PenaltyRules::APPEAL_DAYS)])->save();
            $this->audit->handle($admin, AuditAction::AppealReopened, PenaltyLabel::user($user), $user, $penalty->policy_item, $reason);
            $user->notify((new AccountBanned($penalty))->afterCommit());
        });
    }
}
