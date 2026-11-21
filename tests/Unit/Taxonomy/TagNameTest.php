<?php

use App\Domain\Taxonomy\Rules\TagName;

/*
 * Forma única das tags (RF-128) e a chave das sugestões de união (D79).
 */

test('normaliza maiúsculas, acentos e espaços', function (string $raw, string $expected) {
    expect(TagName::normalize($raw))->toBe($expected);
})->with([
    ['React', 'react'],
    ['  React JS  ', 'react-js'],
    ['react_js', 'react-js'],
    ['Programação Funcional', 'programacao-funcional'],
    ['C#', 'c#'],
    ['C++', 'c++'],
    ['Node.js', 'node.js'],
    ['.NET', 'net'],
    ['--laravel--', 'laravel'],
    ['ganhe   dinheiro!!!', 'ganhe-dinheiro'],
    ['🚀', ''],
]);

test('corta em 40 caracteres', function () {
    expect(TagName::normalize(str_repeat('a', 60)))->toHaveLength(40);
});

test('a chave solta aproxima variações que a normalização não junta', function () {
    expect(TagName::looseKey('reactjs'))->toBe(TagName::looseKey('react'))
        ->and(TagName::looseKey('react-js'))->toBe(TagName::looseKey('react'))
        ->and(TagName::looseKey('node.js'))->toBe('node')
        ->and(TagName::looseKey('js'))->toBe('js')
        ->and(TagName::looseKey('laravel'))->not->toBe(TagName::looseKey('react'));
});
