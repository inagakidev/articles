<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * 2FA da administradora desligado (D84): o painel abre só com a senha, o
 * login não pede código e as telas do 2FA ficam escondidas. O código fica
 * no projeto, atrás de `auth.admin_two_factor`.
 */

test('começa desligado', function () {
    expect(config('auth.admin_two_factor'))->toBeFalse();
});

test('a administradora sem 2FA abre o painel direto', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('auth.adminTwoFactor', false),
        );
});

test('quem já tinha o 2FA entra só com a senha, sem o código', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create();

    $this->post(route('login.store'), ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect(route('admin.dashboard', absolute: false));

    $this->assertAuthenticatedAs($admin);
});

test('a ativação do 2FA não existe', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('admin.two-factor.show'))
        ->assertNotFound();
});

test('as configurações não mostram o 2FA', function () {
    $this->actingAs(User::factory()->admin()->withTwoFactor()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('canManageTwoFactor', false)
            ->missing('twoFactorEnabled'),
        );
});

test('o painel continua fechado para quem não administra', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});
