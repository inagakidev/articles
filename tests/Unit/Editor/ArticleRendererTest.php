<?php

use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use App\Support\Editor\RenderedArticle;

/*
 * A leitura sai do mesmo lugar na prévia e na página pública (p4-06):
 * HTML, sumário, texto puro e contagens (RF-070, RF-095, RF-096).
 */

function render(array $content): RenderedArticle
{
    return (new ArticleRenderer)->render((new DocumentSanitizer)->sanitize(['type' => 'doc', 'content' => $content]));
}

test('títulos ganham âncora e entram no sumário, sem repetir id', function () {
    $result = render([
        ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [['type' => 'text', 'text' => 'O que dispatch() faz']]],
        ['type' => 'heading', 'attrs' => ['level' => 3], 'content' => [['type' => 'text', 'text' => 'Exemplo']]],
        ['type' => 'heading', 'attrs' => ['level' => 3], 'content' => [['type' => 'text', 'text' => 'Exemplo']]],
    ]);

    expect($result->toc)->toBe([
        ['id' => 'o-que-dispatch-faz', 'text' => 'O que dispatch() faz', 'level' => 2],
        ['id' => 'exemplo', 'text' => 'Exemplo', 'level' => 3],
        ['id' => 'exemplo-2', 'text' => 'Exemplo', 'level' => 3],
    ])->and($result->html)->toContain('<h2 id="o-que-dispatch-faz">');
});

test('código sai colorido e escapado, com a linguagem', function () {
    $result = render([['type' => 'codeBlock', 'attrs' => ['language' => 'php'], 'content' => [['type' => 'text', 'text' => '<?php echo "<script>"; // oi']]]]);

    expect($result->html)
        ->toContain('<pre class="code-block" data-language="php">')
        ->toContain('<span class="hl-keyword">')
        ->toContain('&lt;script&gt;')
        ->not->toContain('<script>');
});

test('cores pelo nome, link seguro e espaços preservados', function () {
    $result = render([[
        'type' => 'paragraph',
        'content' => [
            ['type' => 'text', 'text' => 'eu achava que '],
            ['type' => 'text', 'text' => 'isso', 'marks' => [['type' => 'highlight', 'attrs' => ['color' => 'amarelo']]]],
            ['type' => 'text', 'text' => ' e '],
            ['type' => 'text', 'text' => 'site', 'marks' => [['type' => 'link', 'attrs' => ['href' => 'https://he4rt.com']]]],
        ],
    ]]);

    expect($result->html)
        ->toContain('eu achava que <mark class="article-highlight-amarelo">isso</mark> e ')
        ->toContain('<a rel="nofollow ugc noopener" href="https://he4rt.com">site</a>')
        ->not->toContain('target=');
});

test('conta palavras e caracteres do texto e arredonda a leitura para cima', function () {
    $words = implode(' ', array_fill(0, 201, 'palavra'));
    $result = render([
        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $words]]],
    ]);

    expect($result->words)->toBe(201)
        ->and($result->characters)->toBe(mb_strlen($words))
        ->and($result->readingMinutes)->toBe(2)
        ->and(render([])->readingMinutes)->toBe(1);
});

test('o texto puro tem um bloco por linha', function () {
    $result = render([
        ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [['type' => 'text', 'text' => 'Título']]],
        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Olá '], ['type' => 'text', 'text' => 'mundo', 'marks' => [['type' => 'bold']]]]],
    ]);

    expect($result->text)->toBe("Título\nOlá mundo");
});
