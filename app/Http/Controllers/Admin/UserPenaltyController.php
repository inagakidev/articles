<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Moderation\Actions\BanUser;
use App\Domain\Moderation\Actions\ReactivateUser;
use App\Domain\Moderation\Actions\ReopenAppealDeadline;
use App\Domain\Moderation\Actions\SuspendUser;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Domain\Moderation\Queries\ContentPolicyItems;
use App\Domain\Moderation\Queries\UserOverview;
use App\Domain\Moderation\Rules\PenaltyRules;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PenaltyRequest;
use App\Models\Penalty;
use App\Models\User;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Usuários no painel (RF-254 a RF-256, D92): a busca, a conta com os
 * números e o histórico, e aplicar, reativar ou reabrir o prazo (prancha
 * "Admin · Usuário e penalidade").
 */
class UserPenaltyController extends Controller
{
    public const PER_PAGE = 20;

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('q')) ?: null;
        // %, _ e \ digitados valem como texto, não como curinga
        $like = $search === null ? null : '%'.addcslashes(ltrim($search, '@'), '%_\\').'%';

        $users = User::query()
            ->when($like, fn (Builder $query, string $like) => $query->where(fn (Builder $match) => $match
                ->where('name', 'like', $like)
                ->orWhere('username', 'like', $like)
                ->orWhere('email', 'like', $like)))
            ->withCount('penalties')
            ->latest('created_at')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('admin/users', [
            'filters' => ['q' => $search],
            'users' => [
                'data' => $users->getCollection()->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                    'since' => $user->created_at?->toDateString(),
                    'status' => match (true) {
                        $user->is_admin => 'admin',
                        $user->isBanned() => 'banned',
                        $user->isSuspended() => 'suspended',
                        default => 'active',
                    },
                    'penalties' => (int) $user->getAttribute('penalties_count'),
                ])->all(),
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(Request $request, User $user, UserOverview $overview, ContentPolicyItems $policy): Response
    {
        return Inertia::render('admin/user', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'since' => $user->created_at?->toDateString(),
                'verified' => $user->hasVerifiedEmail(),
                'admin' => $user->is_admin,
                'suspendedUntil' => $user->isSuspended() ? $user->suspended_until?->toIso8601String() : null,
                'banned' => $user->isBanned(),
            ],
            'stats' => $overview->for($user),
            'penalties' => $user->penalties()->with(['decidedBy:id,name', 'appeal'])->latest('starts_at')->get()
                ->map(fn (Penalty $penalty) => [
                    'id' => $penalty->id,
                    'type' => $penalty->type->value,
                    'days' => $penalty->ends_at === null ? null : (int) round($penalty->starts_at->diffInDays($penalty->ends_at)),
                    'policyItem' => $penalty->policy_item,
                    'appliedBy' => $penalty->decidedBy?->name,
                    'startsAt' => $penalty->starts_at->toIso8601String(),
                    'status' => $penalty->status(),
                    'reopenable' => $penalty->reopenable(),
                ])->all(),
            // Nem a si mesma, nem outra administradora, nem quem já está penalizada
            'canPenalize' => ! $user->is_admin && $user->id !== $request->user()->id && ! $user->isPenalized(),
            'durations' => PenaltyRules::SUSPENSION_DAYS,
            'appealDays' => PenaltyRules::APPEAL_DAYS,
            'policyItems' => $policy->all(),
        ]);
    }

    public function suspend(PenaltyRequest $request, User $user, SuspendUser $suspend): RedirectResponse
    {
        return $this->attempt(
            fn () => $suspend->handle($user, $request->user(), $request->integer('days'), $request->validated('policy_item'), $request->validated('reason')),
            'moderation.penalties.suspended',
        );
    }

    public function ban(PenaltyRequest $request, User $user, BanUser $ban): RedirectResponse
    {
        return $this->attempt(
            fn () => $ban->handle($user, $request->user(), $request->validated('policy_item'), $request->validated('reason')),
            'moderation.penalties.banned',
        );
    }

    public function reactivate(Request $request, User $user, ReactivateUser $reactivate): RedirectResponse
    {
        return $this->attempt(fn () => $reactivate->handle($user, $request->user()), 'moderation.penalties.reactivated');
    }

    public function reopen(Request $request, Penalty $penalty, ReopenAppealDeadline $reopen): RedirectResponse
    {
        return $this->attempt(
            fn () => $reopen->handle($penalty, $request->user(), $request->string('reason')->toString() ?: null),
            'moderation.appeals.reopened',
        );
    }

    /** Executa a ação e avisa o resultado; uma recusa vira o aviso de erro. */
    private function attempt(Closure $action, string $success): RedirectResponse
    {
        try {
            $action();
        } catch (PenaltyRefused $refused) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __($refused->getMessage())]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __($success)]);

        return back();
    }
}
