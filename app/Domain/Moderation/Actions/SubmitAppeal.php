<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Moderation\Enums\AppealStatus;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Models\Appeal;
use App\Models\Penalty;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SubmitAppeal
{
    public function handle(Penalty $penalty, User $user, string $justification): Appeal
    {
        if ($penalty->user_id !== $user->id) {
            throw PenaltyRefused::appealClosed();
        }

        if ($penalty->appeal_deadline_at === null || $penalty->appeal_deadline_at->isPast()) {
            throw PenaltyRefused::deadlineExpired();
        }

        if ($penalty->appeal()->exists()) {
            throw PenaltyRefused::alreadyAppealed();
        }

        return DB::transaction(function () use ($penalty, $user, $justification) {
            return Appeal::query()->create([
                'penalty_id' => $penalty->id,
                'user_id' => $user->id,
                'justification' => $justification,
                'status' => AppealStatus::Open,
            ]);
        });
    }
}
