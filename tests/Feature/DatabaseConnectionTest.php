<?php

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

test('o relógio do banco usa o fuso da aplicação', function () {
    $databaseNow = Carbon::parse(DB::selectOne('select now() as now')->now, 'UTC');

    expect(abs($databaseNow->diffInSeconds(now())))->toBeLessThan(60);
});

test('a comparação de texto ignora maiúsculas e acentos, mas distingue emojis', function () {
    $equal = fn (string $a, string $b): bool => (bool) DB::selectOne('select ? = ? as equal', [$a, $b])->equal;

    expect($equal('Laravel', 'laravel'))->toBeTrue()
        ->and($equal('café', 'cafe'))->toBeTrue()
        ->and($equal('🔥', '🎉'))->toBeFalse();
});
