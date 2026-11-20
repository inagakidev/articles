<?php

use App\Models\User;

test('diz quando o username está disponível', function () {
    $this->getJson(route('username.availability', ['username' => 'Lia-Martins']))
        ->assertOk()
        ->assertExactJson(['username' => 'lia-martins', 'available' => true, 'message' => null]);
});

test('diz quando o username já está em uso', function () {
    User::factory()->create(['username' => 'lia-martins']);

    $this->getJson(route('username.availability', ['username' => 'lia-martins']))
        ->assertJson(['available' => false, 'message' => __('account.username.taken')]);
});

test('explica o motivo quando o username é inválido ou reservado', function (string $username, string $message) {
    $this->getJson(route('username.availability', ['username' => $username]))
        ->assertJson(['available' => false, 'message' => __($message)]);
})->with([
    ['li', 'account.username.invalid'],
    ['admin', 'account.username.reserved'],
]);

test('limita as consultas por minuto', function () {
    foreach (range(1, 30) as $_) {
        $this->getJson(route('username.availability', ['username' => 'lia']));
    }

    $this->getJson(route('username.availability', ['username' => 'lia']))->assertTooManyRequests();
});
