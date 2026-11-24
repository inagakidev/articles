<?php

namespace App\Http\Controllers\Accounts;

use App\Domain\Accounts\Actions\ReplaceRequiredUsername;
use App\Http\Controllers\Controller;
use App\Http\Requests\Accounts\RequiredUsernameRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Troca obrigatória do username considerado inadequado (prancha "Trocar
 * username obrigatório", RF-178). O middleware EnsureUsernameIsAcceptable
 * traz a pessoa aqui.
 */
class RequiredUsernameController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->username_change_required_at === null) {
            return redirect()->intended(route('home'));
        }

        return Inertia::render('auth/required-username', [
            'username' => $user->username,
            'policyItem' => $user->username_change_policy_item,
        ]);
    }

    public function update(RequiredUsernameRequest $request, ReplaceRequiredUsername $replace): RedirectResponse
    {
        $user = $request->user();
        $username = $request->validated('username');

        if ($username === $user->username) {
            throw ValidationException::withMessages(['username' => __('account.username.same')]);
        }

        $replace->handle($user, $username);

        return redirect()->intended(route('home'));
    }
}
