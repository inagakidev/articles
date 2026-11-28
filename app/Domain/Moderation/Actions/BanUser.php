<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Enums\PenaltyType;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Domain\Moderation\Rules\PenaltyLabel;
use App\Domain\Moderation\Rules\PenaltyRules;
use App\Models\Article;
use App\Models\Comment;
use App\Models\Penalty;
use App\Models\User;
use App\Notifications\Moderation\AccountBanned;
use Illuminate\Support\Facades\DB;

class BanUser
{
    public function __construct(private readonly RecordAudit $audit) {}

    public function handle(User $user, User $admin, string $policyItem, string $reason): Penalty
    {
        if ($user->is_admin || $user->id === $admin->id) {
            throw PenaltyRefused::notPenalizable();
        }

        if ($user->isBanned()) {
            throw PenaltyRefused::active();
        }

        return DB::transaction(function () use ($user, $admin, $policyItem, $reason) {
            $start = now();

            $penalty = Penalty::query()->create([
                'user_id' => $user->id,
                'decided_by_id' => $admin->id,
                'type' => PenaltyType::Ban,
                'policy_item' => $policyItem,
                'reason' => $reason,
                'starts_at' => $start,
                'appeal_deadline_at' => $start->copy()->addDays(PenaltyRules::APPEAL_DAYS),
            ]);

            $user->forceFill([
                'banned_at' => $start,
                'suspended_until' => null,
            ])->save();

            Article::query()->where('user_id', $user->id)->withTrashed()->get()
                ->each(fn (Article $article) => $article->forceDelete());
            Comment::query()->where('user_id', $user->id)->get()
                ->each(fn (Comment $comment) => $comment->delete());

            DB::table('article_likes')->where('user_id', $user->id)->delete();
            DB::table('comment_likes')->where('user_id', $user->id)->delete();
            DB::table('favorites')->where('user_id', $user->id)->delete();

            $this->audit->handle($admin, AuditAction::UserBanned, PenaltyLabel::user($user), $user, $policyItem, $reason);
            $user->notify((new AccountBanned($penalty))->afterCommit());

            return $penalty;
        });
    }
}
