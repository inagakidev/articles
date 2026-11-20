<?php

use App\Domain\Accounts\Rules\Username;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

uses(TestCase::class);

function usernameErrors(string $username): array
{
    return Validator::make(['username' => $username], ['username' => [new Username]])
        ->errors()->get('username');
}

test('aceita usernames no formato', function (string $username) {
    expect(usernameErrors($username))->toBe([]);
})->with(['lia', 'lia-martins', 'lia_martins', 'dev42', str_repeat('a', 30)]);

test('recusa usernames fora do formato', function (string $username) {
    expect(usernameErrors($username))->toBe([__('account.username.invalid')]);
})->with([
    'curto demais' => 'li',
    'longo demais' => str_repeat('a', 31),
    'maiúscula' => 'Lia',
    'acento' => 'lía',
    'começa por número' => '1lia',
    'começa por hífen' => '-lia',
    'espaço' => 'lia martins',
    'ponto' => 'lia.martins',
]);

test('recusa palavras reservadas', function (string $username) {
    expect(usernameErrors($username))->toBe([__('account.username.reserved')]);
})->with(['admin', 'moderador', 'suporte', 'api', 'login', 'he4rt']);

test('recusa o começo de qualquer rota da aplicação', function () {
    // Rotas existentes que não estão na lista fixa.
    expect(Username::isReserved('dashboard'))->toBeTrue()
        ->and(Username::isReserved('privacy'))->toBeTrue()
        ->and(Username::isReserved('lia-martins'))->toBeFalse();
});
