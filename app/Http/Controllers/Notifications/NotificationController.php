<?php

namespace App\Http\Controllers\Notifications;

use App\Domain\Notifications\Queries\UserNotifications;
use App\Http\Controllers\Controller;
use App\Http\Resources\Notifications\NotificationItem;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Notificações (RF-179 a RF-192, D90): a lista, abrir, marcar como lida e
 * excluir, uma por uma ou todas. Cada pessoa só alcança as próprias.
 */
class NotificationController extends Controller
{
    public function __construct(private readonly UserNotifications $notifications) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $unreadOnly = $request->query('filtro') === 'nao-lidas';
        $page = $this->notifications->paginate($user, $unreadOnly, $request->integer('page', 1));

        return Inertia::render('notifications/index', [
            'filter' => $unreadOnly ? 'nao-lidas' : 'todas',
            'unread' => $this->notifications->unreadCount($user),
            // `notifications` é o sino, compartilhado em todas as páginas
            'list' => [
                'data' => collect($page->items())->map(NotificationItem::from(...))->all(),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
            ],
            'retentionDays' => Notification::RETENTION_DAYS,
        ]);
    }

    /** Abrir uma notificação marca como lida e leva ao que ela fala. */
    public function open(Request $request, string $notification): RedirectResponse
    {
        $found = $this->notifications->find($request->user(), $notification);
        $found->markAsRead();

        /** @var array{url?: string} $data */
        $data = $found->data;

        return redirect($data['url'] ?? route('notifications.index'));
    }

    public function read(Request $request, string $notification): RedirectResponse
    {
        $this->notifications->find($request->user(), $notification)->markAsRead();

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);

        return back();
    }

    public function destroy(Request $request, string $notification): RedirectResponse
    {
        $this->notifications->find($request->user(), $notification)->delete();

        return back();
    }

    /** "Limpar lidas" (RF-190). */
    public function clearRead(Request $request): RedirectResponse
    {
        $request->user()->notifications()->whereNotNull('read_at')->delete();

        return back();
    }
}
