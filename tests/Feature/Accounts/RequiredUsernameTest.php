<?php

use App\Models\User;

/*
 * Troca obrigatória do username considerado inadequado (RF-178, D91).
 */

beforeEach(function () {
    $this->user = User::factory()->create(['username' => 'compre-cursos']);
    $this->user->forceFill(['username_change_required_at' => now(), 'username_change_policy_item' => '1.2'])->save();
});

test('com a troca pendente, toda página leva à troca; políticas e sair continuam livres', function () {
    $this->actingAs($this->user)->get(route('articles.index'))->assertRedirect(route('username.required'));
    $this->actingAs($this->user)->get(route('policies.content'))->assertOk();

    $this->actingAs($this->user)->get(route('username.required'))
        ->assertInertia(fn ($page) => $page
            ->component('auth/required-username')
            ->where('username', 'compre-cursos')
            ->where('policyItem', '1.2'));
});

test('o username novo segue as regras; o antigo não vale', function () {
    $taken = User::factory()->create(['username' => 'rafa-moreira']);

    foreach (['compre-cursos', 'admin', '1abc', 'rafa-moreira'] as $invalid) {
        $this->actingAs($this->user)->put(route('username.required.update'), ['username' => $invalid])
            ->assertSessionHasErrors('username');
    }

    expect($this->user->fresh()->username)->toBe('compre-cursos');
});

test('trocar libera o acesso e o endereço antigo deixa de funcionar', function () {
    // Volta para onde a pessoa ia antes da troca
    $this->actingAs($this->user)->get(route('articles.index'));
    $this->actingAs($this->user)
        ->put(route('username.required.update'), ['username' => 'Pedro-Bastos'])
        ->assertRedirect(route('articles.index'));

    $user = $this->user->fresh();
    expect($user->username)->toBe('pedro-bastos')
        ->and($user->username_change_required_at)->toBeNull();

    $this->actingAs($user)->get(route('articles.index'))->assertOk();
    $this->get('/@compre-cursos')->assertNotFound();
    $this->actingAs($user)->get(route('username.required'))->assertRedirect(route('home'));
});
