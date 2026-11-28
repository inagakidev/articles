<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Enums\AppealStatus;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Domain\Moderation\Rules\PenaltyLabel;
use App\Models\Appeal;
use App\Models\User;
use App\Notifications\Moderation\AppealResult;
use Illuminate\Support\Facades\DB;

class DecideAppeal
{
    public function __construct(
        private readonly RecordAudit $audit,
        private readonly ReactivateUser $reactivate,
    ) {}

    public function handle(Appeal $appeal, User $admin, bool $accepted, string $reason): void
    {
        if ($appeal->status !== AppealStatus::Open) {
            throw PenaltyRefused::appealClosed();
        }

        DB::transaction(function () use ($appeal, $admin, $accepted, $reason) {
            $appeal->forceFill([
                'status' => $accepted ? AppealStatus::Accepted : AppealStatus::Rejected,
                'decided_by_id' => $admin->id,
                'decision_reason' => $reason,
                'decided_at' => now(),
            ])->save();

            $penalty = $appeal->penalty;
            $user = $appeal->user;

            if ($accepted) {
                $this->audit->handle($admin, AuditAction::AppealAccepted, PenaltyLabel::user($user), $user, $penalty->policy_item, $reason, [
                    'penalty' => $penalty->type->value,
                ]);
                $this->reactivate->handle($user, $admin, $penalty);
            } else {
                $this->audit->handle($admin, AuditAction::AppealRejected, PenaltyLabel::user($user), $user, $penalty->policy_item, $reason, [
                    'penalty' => $penalty->type->value,
                ]);

            }

            $user->notify((new AppealResult($appeal, $accepted))->afterCommit());
        });
    }
}
