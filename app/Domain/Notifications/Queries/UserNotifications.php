<?php

namespace App\Domain\Notifications\Queries;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * As notificações de uma pessoa, das mais recentes (RF-188 a RF-190). Ler
 * a lista não marca nada como lido.
 */
class UserNotifications
{
    public const PER_PAGE = 20;

    /** Quantas aparecem no menu do sino. */
    public const LATEST = 5;

    /** @return LengthAwarePaginator<int, Notification> */
    public function paginate(User $user, bool $unreadOnly, int $page = 1): LengthAwarePaginator
    {
        return $user->notifications()
            ->when($unreadOnly, fn ($query) => $query->whereNull('read_at'))
            ->paginate(self::PER_PAGE, page: $page);
    }

    /** @return Collection<int, Notification> */
    public function latest(User $user): Collection
    {
        return $user->notifications()->limit(self::LATEST)->get();
    }

    public function unreadCount(User $user): int
    {
        return $user->notifications()->whereNull('read_at')->count();
    }

    public function find(User $user, string $id): Notification
    {
        return $user->notifications()->whereKey($id)->firstOrFail();
    }
}
