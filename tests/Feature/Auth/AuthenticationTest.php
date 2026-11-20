<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Features;

test('exibe a tela de entrar', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});

test('usuários entram pela tela de entrar', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'remember' => '1',
    ]);

    $this->assertAuthenticated();
    // A tela sempre pede para lembrar a sessão (D68).
    $response->assertCookie(Auth::guard()->getRecallerName());
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('usuários com 2FA ativado vão para o desafio de 2FA', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $user = User::factory()->withTwoFactor()->create();

    $response = $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('two-factor.login'));
    $response->assertSessionHas('login.id', $user->id);
    $this->assertGuest();
});

test('não entra com senha inválida', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('usuários saem da conta', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $response->assertRedirect(route('home'));

    $this->assertGuest();
});
