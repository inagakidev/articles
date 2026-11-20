<?php

namespace App\Http\Controllers\Accounts;

use App\Domain\Accounts\Actions\AcceptCurrentPolicies;
use App\Domain\Accounts\Queries\CurrentPolicyVersions;
use App\Domain\Accounts\Queries\PolicyDocument;
use App\Http\Controllers\Controller;
use App\Models\PolicyAcceptance;
use App\Models\PolicyVersion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Novo aceite dos Termos e da Privacidade quando uma versão nova entra em
 * vigor (RF-013, D73). O middleware EnsurePoliciesAccepted traz a pessoa aqui.
 */
class PolicyAcceptanceController extends Controller
{
    public function __construct(private CurrentPolicyVersions $versions) {}

    public function show(Request $request, PolicyDocument $documents): Response|RedirectResponse
    {
        $user = $request->user();
        $pending = $this->versions->pendingFor($user);

        if ($pending === []) {
            return redirect()->intended(route('home'));
        }

        return Inertia::render('auth/accept-policies', [
            'documents' => array_map(function (PolicyVersion $version) use ($user, $documents) {
                $previous = PolicyAcceptance::query()
                    ->where('user_id', $user->id)
                    ->whereRelation('policyVersion', 'type', $version->type)
                    ->with('policyVersion')
                    ->latest('accepted_at')
                    ->first();

                return [
                    'type' => $version->type->value,
                    'version' => $version->version,
                    'publishedAt' => $version->published_at->toDateString(),
                    'changes' => $documents->load($version)['changes'],
                    'previous' => $previous === null ? null : [
                        'version' => $previous->policyVersion->version,
                        'acceptedAt' => $previous->accepted_at->toDateString(),
                    ],
                ];
            }, $pending),
        ]);
    }

    public function store(Request $request, AcceptCurrentPolicies $accept): RedirectResponse
    {
        $request->validate(['accepted' => ['accepted']], attributes: [
            'accepted' => __('account.register.policies_short'),
        ]);

        $accept->handle($request->user());

        return redirect()->intended(route('home'));
    }
}
