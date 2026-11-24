<?php

use App\Domain\Articles\Actions\AssignSlug;
use App\Models\Article;

/*
 * Endereço público do artigo (D83): nasce do título na primeira publicação
 * e não muda mais.
 */

test('gera o slug do título, sem acentos nem pontuação', function () {
    $article = Article::factory()->create();

    expect((new AssignSlug)->handle($article, 'Introdução ao Laravel: do zero à primeira página!'))
        ->toBe('introducao-ao-laravel-do-zero-a-primeira-pagina')
        ->and($article->fresh()->slug)->toBe('introducao-ao-laravel-do-zero-a-primeira-pagina');
});

test('título repetido ganha um número, contando a lixeira', function () {
    $first = Article::factory()->create();
    (new AssignSlug)->handle($first, 'Filas no Laravel');
    $first->delete();

    expect((new AssignSlug)->handle(Article::factory()->create(), 'Filas no Laravel'))->toBe('filas-no-laravel-2')
        ->and((new AssignSlug)->handle(Article::factory()->create(), 'Filas no Laravel'))->toBe('filas-no-laravel-3');
});

test('não muda depois de criado, nem com outro título', function () {
    $article = Article::factory()->create();
    (new AssignSlug)->handle($article, 'Título antigo');

    expect((new AssignSlug)->handle($article, 'Título novo'))->toBe('titulo-antigo');
});

test('título longo é cortado numa palavra inteira', function () {
    $slug = (new AssignSlug)->handle(Article::factory()->create(), str_repeat('palavra ', 30));

    expect(strlen($slug))->toBeLessThanOrEqual(AssignSlug::MAX)
        ->and($slug)->toEndWith('palavra');
});

test('título sem letras ainda dá um endereço', function () {
    expect((new AssignSlug)->handle(Article::factory()->create(), '!!!'))->toBe('artigo');
});
