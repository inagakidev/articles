<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Moderation\Actions\DecideAppeal;
use App\Domain\Moderation\Enums\AppealStatus;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AppealDecisionRequest;
use App\Models\Appeal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppealController extends Controller
{
    public function index(Request $request): Response
    {
        $status = AppealStatus::tryFrom((string) $request->query('status', 'open')) ?? AppealStatus::Open;

        $appeals = Appeal::query()
            ->with(['penalty.decidedBy:id,name', 'user:id,name,username,avatar_path', 'decidedBy:id,name'])
            ->where('status', $status)
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/appeals', [
            'filters' => ['status' => $status->value],
            'appeals' => [
                'data' => $appeals->getCollection()->map(fn (Appeal $appeal) => [
                    'id' => $appeal->id,
                    'status' => $appeal->status->value,
                    'body' => $appeal->justification,
                    'sentAt' => $appeal->created_at->toIso8601String(),
                    'decisionReason' => $appeal->decision_reason,
                    'decidedBy' => $appeal->decidedBy?->name,
                    'decidedAt' => $appeal->decided_at?->toIso8601String(),
                    'user' => [
                        'name' => $appeal->user->name,
                        'username' => $appeal->user->username,
                        'avatar' => $appeal->user->avatar,
                    ],
                    'penalty' => [
                        'type' => $appeal->penalty->type->value,
                        'until' => $appeal->penalty->ends_at?->toIso8601String(),
                        'policyItem' => $appeal->penalty->policy_item,
                        'reason' => $appeal->penalty->reason,
                        'appliedBy' => $appeal->penalty->decidedBy?->name,
                        'startsAt' => $appeal->penalty->starts_at->toIso8601String(),
                    ],
                ]),
                'currentPage' => $appeals->currentPage(),
                'lastPage' => $appeals->lastPage(),
                'total' => $appeals->total(),
            ],
            'openCount' => Appeal::query()->where('status', AppealStatus::Open)->count(),
        ]);
    }

    public function decide(AppealDecisionRequest $request, Appeal $appeal, DecideAppeal $decide): RedirectResponse
    {
        try {
            $decide->handle(
                $appeal,
                $request->user(),
                $request->boolean('accepted'),
                $request->validated('reason'),
            );
        } catch (PenaltyRefused $error) {
            return back()->withErrors(['appeal' => __($error->getMessage())]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('moderation.appeals.decided'),
        ]);

        return redirect()->route('admin.appeals');
    }
}
