<?php

namespace App\Domain\Moderation\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class EndExpiredSuspensions
{
    public function __construct(private readonly ReactivateUser $reactivate) {}

    public function handle(): int
    {
        $count = 0;

        User::query()->whereNotNull('suspended_until')->where('suspended_until', '<=', now())->get()
            ->each(function (User $user) use (&$count) {
                DB::transaction(function () use ($user, &$count) {
                    $this->reactivate->handle($user, null);
                    $count++;
                });
            });

        return $count;
    }
}
