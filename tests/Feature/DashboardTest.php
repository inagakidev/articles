<?php

use App\Models\User;

test('visitantes são redirecionados para entrar', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('usuários autenticados acessam o painel', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});
