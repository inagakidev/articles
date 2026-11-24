<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use PragmaRX\Google2FA\Google2FA;

/*
 * Ativação do 2FA antes do primeiro acesso ao painel (RF-017): ligar,
 * confirmar com o código do app e ver os códigos de recuperação uma vez.
 */

function confirmedPassword(): array
{
    return ['auth.password_confirmed_at' => time()];
}

// Estes testes descrevem o 2FA ligado (D75); hoje ele fica desligado (D84).
beforeEach(fn () => config(['auth.admin_two_factor' => true]));

test('pede a senha antes da ativação', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.two-factor.show'))
        ->assertRedirect(route('password.confirm'));
});

test('começa pedindo para ligar o 2FA', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->withSession(confirmedPassword())
        ->get(route('admin.two-factor.show'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/two-factor-setup')
            ->where('step', 'start')
            ->where('qrCodeSvg', null)
            ->where('recoveryCodes', []),
        );
});

test('ativa, confirma com o código e mostra os códigos de recuperação uma vez', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->withSession(confirmedPassword());

    $this->post(route('two-factor.enable'))->assertRedirect();

    $this->get(route('admin.two-factor.show'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('step', 'scan')
            ->where('qrCodeSvg', fn (string $svg) => str_contains($svg, '<svg'))
            ->where('secretKey', decrypt($admin->fresh()->two_factor_secret)),
        );

    $code = app(Google2FA::class)->getCurrentOtp(decrypt($admin->fresh()->two_factor_secret));

    $this->from(route('admin.two-factor.show'))
        ->post(route('two-factor.confirm'), ['code' => $code])
        ->assertRedirect(route('admin.two-factor.show'));

    $this->get(route('admin.two-factor.show'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('step', 'recovery')
            ->where('recoveryCodes', $admin->fresh()->recoveryCodes())
            ->where('qrCodeSvg', null)
            ->where('secretKey', null),
        );

    expect($admin->fresh()->hasConfirmedTwoFactor())->toBeTrue();

    // Na volta, os códigos não aparecem de novo e o painel abre.
    $this->get(route('admin.two-factor.show'))->assertRedirect(route('admin.dashboard'));
    $this->get(route('admin.dashboard'))->assertOk();
});

test('código errado não confirma e avisa em português', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->withSession(confirmedPassword());
    $this->post(route('two-factor.enable'));

    $this->withHeader('Accept-Language', 'pt-BR')
        ->from(route('admin.two-factor.show'))
        ->post(route('two-factor.confirm'), ['code' => '000000'])
        ->assertSessionHasErrors(
            ['code' => 'Esse código não confere. Confira o horário do celular e use o código que está na tela agora.'],
            errorBag: 'confirmTwoFactorAuthentication',
        );

    expect($admin->fresh()->hasConfirmedTwoFactor())->toBeFalse();
});

test('quem já tem o 2FA vai direto para o painel', function () {
    $this->actingAs(User::factory()->admin()->withTwoFactor()->create())
        ->withSession(confirmedPassword())
        ->get(route('admin.two-factor.show'))
        ->assertRedirect(route('admin.dashboard'));
});
