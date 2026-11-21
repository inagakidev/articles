<?php

namespace App\Http\Controllers\Settings;

use App\Domain\Accounts\Actions\SecureAccountAfterPasswordChange;
use App\Domain\Accounts\Enums\SecurityEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use App\Models\SecurityEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

/**
 * "Privacidade e segurança": e-mail (troca com confirmação, RF-030), senha
 * (RF-031) e, para a administradora, o 2FA (RF-017). As demais pessoas não
 * veem o 2FA no MVP (RF-019).
 */
class SecurityController extends Controller
{
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $user = $request->user();
        $passwordChangedAt = SecurityEvent::query()
            ->where('user_id', $user->id)
            ->where('type', SecurityEventType::PasswordChanged)
            ->latest('id')
            ->first()
            ?->created_at;

        $props = [
            'email' => $user->email,
            'pendingEmail' => $user->hasPendingEmail() ? [
                'address' => $user->pending_email,
                'expiresAt' => $user->pending_email_expires_at?->toIso8601String(),
            ] : null,
            'passwordChangedAt' => $passwordChangedAt?->toIso8601String(),
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'canManageTwoFactor' => $user->is_admin && Features::canManageTwoFactorAuthentication(),
        ];

        if ($props['canManageTwoFactor']) {
            $props['twoFactorEnabled'] = $user->hasConfirmedTwoFactor();
            $props['recoveryCodes'] = $request->session()->get('status') === Fortify::RECOVERY_CODES_GENERATED
                ? $user->recoveryCodes()
                : [];
        }

        return Inertia::render('settings/security', $props);
    }

    /**
     * Troca a senha logada: as outras sessões caem, o evento é registrado e
     * chega o aviso por e-mail (RF-024, RF-031). Esta sessão continua.
     */
    public function update(PasswordUpdateRequest $request, SecureAccountAfterPasswordChange $secure): RedirectResponse
    {
        $user = $request->user();
        $user->update(['password' => $request->password]);

        $secure->handle($user, $request, keepSessionId: $request->session()->getId());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('settings.password.saved')]);

        return back();
    }
}
