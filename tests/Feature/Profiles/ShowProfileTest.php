<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Perfil público em /@username (RF-025, D77): só o que é público.
 */

test('mostra nome, username, bio, foto e desde quando a pessoa está na comunidade', function () {
    $user = User::factory()->create([
        'name' => 'Rafa Moreira',
        'username' => 'rafa-moreira',
        'bio' => 'Dev back-end.',
        'email' => 'rafa@exemplo.dev',
    ]);

    $this->get('/@rafa-moreira')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('profile/show')
            ->where('profile', [
                'name' => 'Rafa Moreira',
                'username' => 'rafa-moreira',
                'bio' => 'Dev back-end.',
                'avatar' => null,
                'memberSince' => $user->created_at->toDateString(),
            ])
            ->where('articles', [])
            ->where('articleCount', 0),
        );
});

test('nunca envia o e-mail nem dados da conta', function () {
    User::factory()->create(['username' => 'rafa', 'email' => 'rafa@exemplo.dev']);

    $this->get('/@rafa')->assertDontSee('rafa@exemplo.dev');
});

test('conta sem e-mail confirmado ou inexistente não tem perfil', function () {
    User::factory()->unverified()->create(['username' => 'nova']);

    $this->get('/@nova')->assertNotFound();
    $this->get('/@ninguem')->assertNotFound();
});
