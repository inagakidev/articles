<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Quem entra no painel (p3-09, p3-12): visitante vai para o login, usuário
 * comum recebe 403, e a administradora só passa com o 2FA confirmado.
 */

test('visitante vai para o login', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    $this->get(route('admin.two-factor.show'))->assertRedirect(route('login'));
});

test('usuário comum recebe 403, mesmo com 2FA', function (string $route) {
    $this->actingAs(User::factory()->withTwoFactor()->create())
        ->get(route($route))
        ->assertForbidden();
})->with(['admin.dashboard', 'admin.two-factor.show']);

test('administradora sem e-mail confirmado vai confirmar o e-mail', function () {
    $this->actingAs(User::factory()->admin()->unverified()->create())
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('verification.notice'));
});

test('administradora sem 2FA confirmado vai para a ativação', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.two-factor.show'));
});

test('2FA ligado mas não confirmado ainda não abre o painel', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create(['two_factor_confirmed_at' => null]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertRedirect(route('admin.two-factor.show'));
});

test('administradora com 2FA vê o painel com o total de usuários', function () {
    User::factory()->count(2)->create();
    User::factory()->unverified()->create();

    $this->actingAs(User::factory()->admin()->withTwoFactor()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('metrics.users', 4)
            ->where('attention', [])
            ->has('updatedAt'),
        );
});

test('is_admin não é preenchido em massa', function () {
    $user = User::factory()->create();

    $user->update(['is_admin' => true]);

    expect($user->fresh()->is_admin)->toBeFalse();
});

test('depois do login, a administradora vai para o painel e as demais pessoas para o início', function (bool $admin, string $route) {
    $user = User::factory()->state(['is_admin' => $admin])->create();

    $this->post(route('login'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route($route, absolute: false));
})->with([
    'administradora' => [true, 'admin.dashboard'],
    'pessoa comum' => [false, 'dashboard'],
]);

test('o login vale como senha confirmada, sem pedir a senha de novo em seguida', function () {
    $admin = User::factory()->admin()->create();

    $this->post(route('login'), ['email' => $admin->email, 'password' => 'password']);

    $this->get(route('admin.two-factor.show'))->assertOk();
});
