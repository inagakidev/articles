<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Ativação do 2FA antes do primeiro acesso ao painel (RF-017, D75). Os
 * passos usam as rotas do Fortify: ligar, confirmar com o código e ver os
 * códigos de recuperação, que aparecem uma vez, logo depois da confirmação.
 */
class TwoFactorSetupController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        // 2FA desligado (D84): a ativação não existe para quem visita
        abort_unless(config('auth.admin_two_factor'), 404);

        $user = $request->user();
        $justConfirmed = $request->session()->get('status') === 'two-factor-authentication-confirmed';

        if ($user->hasConfirmedTwoFactor() && ! $justConfirmed) {
            return redirect()->intended(route('admin.dashboard'));
        }

        return Inertia::render('auth/two-factor-setup', [
            'step' => match (true) {
                $justConfirmed => 'recovery',
                $user->two_factor_secret !== null => 'scan',
                default => 'start',
            },
            'qrCodeSvg' => fn () => $user->two_factor_secret !== null && ! $justConfirmed
                ? $user->twoFactorQrCodeSvg()
                : null,
            'secretKey' => fn () => $user->two_factor_secret !== null && ! $justConfirmed
                ? decrypt($user->two_factor_secret)
                : null,
            'recoveryCodes' => fn () => $justConfirmed ? $user->recoveryCodes() : [],
        ]);
    }
}
