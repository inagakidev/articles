<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Moderation\Actions\BanUser;
use App\Domain\Moderation\Actions\ReactivateUser;
use App\Domain\Moderation\Actions\SuspendUser;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PenaltyRequest;
use App\Models\Penalty;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserPenaltyController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q')) ?: null;

        $users = User::query()
            ->when($search, fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"))
            ->with(['penalties' => fn ($penalties) => $penalties->latest('starts_at')->limit(1)])
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users', [
            'filters' => ['q' => $search],
            'users' => [
                'data' => $users->getCollection()->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'banned' => $user->isBanned(),
                    'suspendedUntil' => $user->suspended_until?->toIso8601String(),
                    'penalty' => $user->penalties->first() ? [
                        'type' => $user->penalties->first()->type->value,
                        'reason' => $user->penalties->first()->reason,
                        'endsAt' => $user->penalties->first()->ends_at?->toIso8601String(),
                    ] : null,
                ]),
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function suspend(PenaltyRequest $request, User $user, SuspendUser $suspend): RedirectResponse
    {
        try {
            $suspend->handle(
                $user,
                $request->user(),
                (int) $request->integer('days', 7),
                $request->validated('policy_item'),
                $request->validated('reason'),
            );
        } catch (PenaltyRefused $error) {
            return back()->withErrors(['penalty' => __($error->getMessage())]);
        }

        return back()->with('toast', ['type' => 'success', 'message' => __('moderation.penalties.suspended')]);
    }

    public function ban(PenaltyRequest $request, User $user, BanUser $ban): RedirectResponse
    {
        try {
            $ban->handle(
                $user,
                $request->user(),
                $request->validated('policy_item'),
                $request->validated('reason'),
            );
        } catch (PenaltyRefused $error) {
            return back()->withErrors(['penalty' => __($error->getMessage())]);
        }

        return back()->with('toast', ['type' => 'success', 'message' => __('moderation.penalties.banned')]);
    }

    public function reactivate(Request $request, User $user, ReactivateUser $reactivate): RedirectResponse
    {
        $reactivate->handle($user, $request->user());

        return back()->with('toast', ['type' => 'success', 'message' => __('moderation.penalties.reactivated')]);
    }
}
