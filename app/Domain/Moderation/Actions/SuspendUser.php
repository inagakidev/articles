<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Articles\Actions\WithdrawPending;
use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Enums\PenaltyType;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Domain\Moderation\Rules\PenaltyLabel;
use App\Models\Article;
use App\Models\Penalty;
use App\Models\User;
use App\Notifications\Moderation\AccountSuspended;
use Illuminate\Support\Facades\DB;

class SuspendUser
{
    public function __construct(
        private readonly RecordAudit $audit,
        private readonly WithdrawPending $withdraw,
    ) {}

    public function handle(User $user, User $admin, int $days, string $policyItem, string $reason): Penalty
    {
        if ($user->isBanned() || $user->isSuspended()) {
            throw PenaltyRefused::active();
        }

        return DB::transaction(function () use ($user, $admin, $days, $policyItem, $reason) {
            $start = now();
            $end = $start->copy()->addDays($days);
            $deadline = $start->copy()->addDays(7);

            $penalty = Penalty::query()->create([
                'user_id' => $user->id,
                'decided_by_id' => $admin->id,
                'type' => PenaltyType::Suspension,
                'policy_item' => $policyItem,
                'reason' => $reason,
                'starts_at' => $start,
                'ends_at' => $end,
                'appeal_deadline_at' => $deadline,
            ]);

            $user->forceFill(['suspended_until' => $end])->save();

            Article::query()->where('user_id', $user->id)->withTrashed()->get()
                ->each(fn (Article $article) => $this->withdraw->handle($article, WithdrawPending::KEEP_DRAFT));

            $this->audit->handle($admin, AuditAction::UserSuspended, PenaltyLabel::user($user), $user, $policyItem, $reason, [
                'days' => $days,
                'endsAt' => $end->toIso8601String(),
            ]);

            $user->notify((new AccountSuspended($penalty))->afterCommit());

            return $penalty;
        });
    }
}
