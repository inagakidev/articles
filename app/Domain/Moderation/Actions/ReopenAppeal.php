<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Enums\AppealStatus;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Domain\Moderation\Rules\PenaltyLabel;
use App\Models\Appeal;
use App\Models\User;

class ReopenAppeal
{
    public function __construct(private readonly RecordAudit $audit) {}

    public function handle(Appeal $appeal, User $admin, ?string $reason = null): void
    {
        $penalty = $appeal->penalty;
        $user = $appeal->user;

        if ($penalty->user_id !== $user->id || $user->banned_at === null) {
            throw PenaltyRefused::appealClosed();
        }

        if ($appeal->status !== AppealStatus::Rejected) {
            throw PenaltyRefused::appealClosed();
        }

        $deadline = now()->addDays(7);
        $appeal->forceFill([
            'status' => AppealStatus::Open,
            'decided_by_id' => null,
            'decision_reason' => null,
            'decided_at' => null,
            'reopen_deadline_at' => $deadline,
        ])->save();
        $penalty->forceFill([
            'appeal_deadline_at' => $deadline,
            'ended_at' => null,
        ])->save();

        $this->audit->handle($admin, AuditAction::AppealReopened, PenaltyLabel::user($user), $user, $penalty->policy_item, $reason);
    }
}
