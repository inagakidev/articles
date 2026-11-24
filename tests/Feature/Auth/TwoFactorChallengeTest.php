<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

beforeEach(function () {
    // O desafio só existe com o 2FA ligado (D75); hoje ele fica desligado (D84).
    config(['auth.admin_two_factor' => true]);

    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());
});

test('o desafio de 2FA redireciona para entrar sem autenticação', function () {
    $response = $this->get(route('two-factor.login'));

    $response->assertRedirect(route('login'));
});

test('exibe o desafio de 2FA', function () {
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->get(route('two-factor.login'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/two-factor-challenge'),
        );
});
