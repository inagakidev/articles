<?php

use App\Models\User;

test('visitantes são redirecionados para entrar', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('o painel do kit inicial leva a Meus artigos (D82)', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertRedirect('/my-articles');
});
