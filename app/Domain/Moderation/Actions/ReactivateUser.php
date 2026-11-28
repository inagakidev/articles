<?php

namespace App\Domain\Moderation\Actions;

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Moderation\Enums\PenaltyType;
use App\Domain\Moderation\Rules\PenaltyLabel;
use App\Models\Article;
use App\Models\Notification;
use App\Models\Penalty;
use App\Models\User;
use App\Notifications\Moderation\AccountReactivated;
use Illuminate\Support\Facades\DB;

class ReactivateUser
{
    public function __construct(private readonly RecordAudit $audit) {}

    public function handle(User $user, ?User $admin, ?Penalty $penalty = null): void
    {
        DB::transaction(function () use ($user, $admin, $penalty) {
            $penalty ??= Penalty::query()
                ->where('user_id', $user->id)
                ->whereNull('ended_at')
                ->latest('starts_at')
                ->first();

            if ($penalty === null) {
                return;
            }

            if ($penalty->type === PenaltyType::Suspension) {
                $pause = $penalty->starts_at->diffInSeconds(min(now(), $penalty->ends_at ?? now()));
                Article::query()->onlyTrashed()->where('user_id', $user->id)->get()
                    ->each(function (Article $article) use ($pause) {
                        $article->forceFill(['deleted_at' => $article->deleted_at?->copy()->addSeconds($pause)])->saveQuietly();
                    });
                // As notificações também recomeçam de onde pararam (RF-215, RF-223)
                $user->notifications()->get(['id', 'updated_at'])
                    ->each(fn (Notification $notice) => Notification::query()->whereKey($notice->id)
                        ->update(['updated_at' => $notice->updated_at?->copy()->addSeconds($pause)]));

                $user->forceFill(['suspended_until' => null])->save();
            } else {
                $user->forceFill(['banned_at' => null])->save();
            }

            $penalty->forceFill(['ended_at' => now()])->save();
            $this->audit->handle($admin, AuditAction::UserReactivated, PenaltyLabel::user($user), $user);
            $user->notify((new AccountReactivated($penalty))->afterCommit());
        });
    }
}
