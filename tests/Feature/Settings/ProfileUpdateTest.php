<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * "Conta e perfil": nome, username e bio do perfil público (RF-025 a RF-029).
 */

test('mostra o perfil público para editar', function () {
    $user = User::factory()->create(['bio' => 'Escrevo sobre filas.']);

    $this->actingAs($user)
        ->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile')
            ->where('profile.name', $user->name)
            ->where('profile.username', $user->username)
            ->where('profile.bio', 'Escrevo sobre filas.')
            ->where('profile.avatar', null)
            ->where('bioMax', 300),
        );
});

test('atualiza nome, username (em minúsculas) e bio', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Lia Martins',
            'username' => 'Lia-Martins',
            'bio' => '  Front-end e acessibilidade.  ',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Lia Martins')
        ->and($user->username)->toBe('lia-martins')
        ->and($user->bio)->toBe('Front-end e acessibilidade.');
});

test('o e-mail não muda por aqui: tem o próprio fluxo com confirmação', function () {
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);

    $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'username' => $user->username,
        'email' => 'outro@exemplo.dev',
    ]);

    expect($user->fresh()->email)->toBe('lia@exemplo.dev');
});

test('recusa username em uso, reservado ou fora do formato', function (string $username) {
    User::factory()->create(['username' => 'ocupado']);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch(route('profile.update'), ['name' => 'Lia', 'username' => $username])
        ->assertSessionHasErrors('username');
})->with(['ocupado', 'admin', 'li', '1lia', 'lia martins']);

test('manter o próprio username não conta como em uso', function () {
    $user = User::factory()->create(['username' => 'lia']);

    $this->actingAs($user)
        ->patch(route('profile.update'), ['name' => 'Lia', 'username' => 'lia'])
        ->assertSessionHasNoErrors();
});

test('bio tem até 300 caracteres e pode ficar vazia', function () {
    $user = User::factory()->create(['bio' => 'Antes']);

    $this->actingAs($user)
        ->patch(route('profile.update'), ['name' => 'Lia', 'username' => $user->username, 'bio' => str_repeat('a', 301)])
        ->assertSessionHasErrors('bio');

    $this->actingAs($user)
        ->patch(route('profile.update'), ['name' => 'Lia', 'username' => $user->username, 'bio' => ''])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->bio)->toBeNull();
});

test('conta sem confirmar também edita o perfil (RF-297)', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->get(route('profile.edit'))->assertOk();
});

test('a exclusão imediata do kit não existe mais: a exclusão tem carência (fatia 22)', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->delete('/settings/profile', ['password' => 'password']);

    expect($user->fresh())->not->toBeNull();
});
