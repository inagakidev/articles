<?php

namespace App\Http\Middleware;

use App\Domain\Moderation\Queries\ApprovalQueue;
use App\Domain\Notifications\Queries\UserNotifications;
use App\Http\Resources\Notifications\NotificationItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => app()->getLocale(),
            'auth' => [
                'user' => $request->user(),
                // O painel mostra "2FA ativo" só com o 2FA ligado (D84)
                'adminTwoFactor' => (bool) config('auth.admin_two_factor'),
            ],
            // O sino: não lidas e as últimas, para quem está logada (RF-188)
            'notifications' => fn () => $request->user() === null ? null : [
                'unread' => app(UserNotifications::class)->unreadCount($request->user()),
                'latest' => app(UserNotifications::class)->latest($request->user())->map(NotificationItem::from(...))->all(),
            ],
            // A contagem da fila na lateral do painel, só para a administradora
            'adminCounts' => fn () => $request->user()?->is_admin
                ? ['queue' => app(ApprovalQueue::class)->count()]
                : null,
        ];
    }
}
