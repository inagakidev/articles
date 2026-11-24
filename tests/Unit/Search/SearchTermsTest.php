<?php

use App\Domain\Search\Queries\ArticleSearch;

/*
 * Como a busca separa os termos (D85): o que o FULLTEXT indexa, os curtos
 * tratados à parte e as palavras que não ajudam.
 */

test('separa os termos longos dos curtos', function () {
    expect(ArticleSearch::terms('Filas em Go e JS'))->toBe(['long' => ['filas'], 'short' => ['go', 'js']]);
});

test('ignora palavras comuns e letras soltas', function () {
    expect(ArticleSearch::terms('como usar o Pest para testes de API'))
        ->toBe(['long' => ['usar', 'pest', 'testes', 'api'], 'short' => []]);
});

test('mantém os sinais de termos técnicos curtos', function () {
    expect(ArticleSearch::terms('C# vs C++'))->toBe(['long' => [], 'short' => ['c#', 'vs']]);
});

test('quebra nas pontuações como o índice, sem repetir', function () {
    expect(ArticleSearch::terms('node.js node-js laravel, laravel'))
        ->toBe(['long' => ['node', 'laravel'], 'short' => []]);
});

test('operadores da busca booleana não chegam ao índice', function () {
    expect(ArticleSearch::terms('+filas -redis "worker*" (fila)'))
        ->toBe(['long' => ['filas', 'redis', 'worker', 'fila'], 'short' => []]);
});

test('termo vazio não gera nada', function () {
    expect(ArticleSearch::terms('   '))->toBe(['long' => [], 'short' => []]);
});
