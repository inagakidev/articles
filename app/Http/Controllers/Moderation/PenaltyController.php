<?php

namespace App\Http\Controllers\Moderation;

use App\Domain\Moderation\Actions\SubmitAppeal;
use App\Domain\Moderation\Exceptions\PenaltyRefused;
use App\Http\Controllers\Controller;
use App\Http\Requests\Moderation\AppealRequest;
use App\Models\Penalty;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class PenaltyController extends Controller
{
    public function suspended(Request $request): Response
    {
        $penalty = Penalty::query()->where('user_id', $request->user()->id)->latest('starts_at')->first();

        return Inertia::render('account/suspended', [
            'penalty' => $penalty ? [
                'type' => $penalty->type->value,
                'reason' => $penalty->reason,
                'policyItem' => $penalty->policy_item,
                'endsAt' => $penalty->ends_at?->toIso8601String(),
                'appealDeadline' => $penalty->appeal_deadline_at?->toIso8601String(),
                'appealUrl' => $penalty->appeal_deadline_at?->isFuture()
                    ? URL::temporarySignedRoute('penalty.appeal', $penalty->appeal_deadline_at, ['penalty' => $penalty->id])
                    : null,
            ] : null,
        ]);
    }

    public function appeal(Request $request, Penalty $penalty): Response
    {
        abort_unless($request->hasValidSignature(), 403);

        return Inertia::render('account/appeal', [
            'penaltyId' => $penalty->id,
            'type' => $penalty->type->value,
            'policyItem' => $penalty->policy_item,
            'deadline' => $penalty->appeal_deadline_at?->toIso8601String(),
            'alreadyAppealed' => $penalty->appeal()->exists(),
            'submitUrl' => URL::temporarySignedRoute('penalty.appeal.submit', $penalty->appeal_deadline_at ?? now()->addDays(7), ['penalty' => $penalty->id]),
        ]);
    }

    public function submit(AppealRequest $request, Penalty $penalty, SubmitAppeal $submit): RedirectResponse
    {
        abort_unless($request->hasValidSignature(), 403);
        $user = $penalty->user;
        abort_if($user === null, 404);

        try {
            $submit->handle($penalty, $user, $request->validated('justification'));
        } catch (PenaltyRefused $error) {
            return back()->withErrors(['justification' => __($error->getMessage())]);
        }

        return back()->with('toast', ['type' => 'success', 'message' => __('moderation.appeals.submitted')]);
    }
}
