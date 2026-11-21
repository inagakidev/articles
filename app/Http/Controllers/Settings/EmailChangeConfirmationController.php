<?php

namespace App\Http\Controllers\Settings;

use App\Domain\Accounts\Actions\ConfirmEmailChange;
use App\Domain\Accounts\Exceptions\EmailChangeFailed;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * O link do e-mail novo (RF-030). Vale mesmo aberto em outro aparelho, sem
 * login: a assinatura e o hash do e-mail pendente garantem que é o pedido
 * de agora.
 */
class EmailChangeConfirmationController extends Controller
{
    public function __invoke(Request $request, User $user, string $hash, ConfirmEmailChange $confirm): RedirectResponse
    {
        $target = $request->user()?->is($user) ? route('security.edit') : route('login');

        if ($user->pending_email === null || ! hash_equals(sha1($user->pending_email), $hash)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('settings.email.link_expired')]);

            return redirect($target);
        }

        try {
            $confirm->handle($user, $request);
        } catch (EmailChangeFailed $exception) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __($exception->getMessage())]);

            return redirect($target);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('settings.email.confirmed')]);

        return redirect($target);
    }
}
