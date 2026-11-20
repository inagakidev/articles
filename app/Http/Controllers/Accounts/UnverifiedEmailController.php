<?php

namespace App\Http\Controllers\Accounts;

use App\Concerns\ProfileValidationRules;
use App\Domain\Accounts\Enums\SecurityEventType;
use App\Http\Controllers\Controller;
use App\Http\Responses\VerificationLinkResponse;
use App\Models\SecurityEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * "Usar outro e-mail" na tela de confirmação: corrige o e-mail de uma conta
 * que ainda não o confirmou e manda um novo link. Contas já confirmadas
 * trocam o e-mail pelas configurações (RF-030, fatia 6).
 */
class UnverifiedEmailController extends Controller
{
    use ProfileValidationRules;

    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_if($user->hasVerifiedEmail(), 403);

        $validated = $request->validate(['email' => $this->emailRules($user->id)]);

        DB::transaction(function () use ($user, $validated, $request) {
            $user->forceFill(['email' => $validated['email']])->save();

            SecurityEvent::create([
                'user_id' => $user->id,
                'type' => SecurityEventType::EmailChanged,
                'email' => $user->email,
                'ip_address' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 512, ''),
            ]);

            $user->sendEmailVerificationNotification();
        });

        return redirect()
            ->route('verification.notice')
            ->with('resendAfter', VerificationLinkResponse::RESEND_AFTER);
    }
}
