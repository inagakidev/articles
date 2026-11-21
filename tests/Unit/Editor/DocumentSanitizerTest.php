<?php

use App\Support\Editor\DocumentSanitizer;

/*
 * Só passa o que o esquema do editor permite (RF-066 a RF-069, D80).
 */

function sanitize(array $content): array
{
    return (new DocumentSanitizer)->sanitize(['type' => 'doc', 'content' => $content])['content'];
}

function paragraph(array ...$texts): array
{
    return ['type' => 'paragraph', 'content' => $texts];
}

test('documento inválido vira documento vazio', function (mixed $input) {
    expect((new DocumentSanitizer)->sanitize($input))->toBe(DocumentSanitizer::empty());
})->with([[null], ['texto'], [[]], [[['type' => 'paragraph']]], [['type' => 'heading']]]);

test('mantém o que o editor oferece', function () {
    $content = [
        ['type' => 'heading', 'attrs' => ['level' => 3, 'textAlign' => 'center'], 'content' => [['type' => 'text', 'text' => 'Título']]],
        paragraph(
            ['type' => 'text', 'text' => 'eu achava que '],
            ['type' => 'text', 'text' => 'x', 'marks' => [['type' => 'bold'], ['type' => 'italic'], ['type' => 'code']]],
            ['type' => 'text', 'text' => 'cor', 'marks' => [['type' => 'textColor', 'attrs' => ['color' => 'menta']], ['type' => 'highlight', 'attrs' => ['color' => 'amarelo']]]],
            ['type' => 'text', 'text' => 'site', 'marks' => [['type' => 'link', 'attrs' => ['href' => 'https://he4rt.com']]]],
        ),
        ['type' => 'codeBlock', 'attrs' => ['language' => 'php'], 'content' => [['type' => 'text', 'text' => '<?php echo 1;']]],
        ['type' => 'horizontalRule'],
    ];

    expect(sanitize($content))->toBe($content);
});

test('descarta nós, marcas e atributos fora do esquema', function () {
    $result = sanitize([
        ['type' => 'image', 'attrs' => ['src' => 'x.png']],
        ['type' => 'heading', 'attrs' => ['level' => 1], 'content' => [['type' => 'text', 'text' => 'H1']]],
        paragraph(
            ['type' => 'text', 'text' => 'a', 'marks' => [['type' => 'underline'], ['type' => 'strike']]],
            ['type' => 'text', 'text' => 'b', 'marks' => [['type' => 'textColor', 'attrs' => ['color' => '#ff0000']]]],
            ['type' => 'text', 'text' => ''],
        ),
        ['type' => 'paragraph', 'attrs' => ['textAlign' => 'justify', 'style' => 'color:red']],
        ['type' => 'codeBlock', 'attrs' => ['language' => 'brainfuck'], 'content' => [['type' => 'text', 'text' => 'x', 'marks' => [['type' => 'bold']]]]],
    ]);

    expect($result)->toBe([
        ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [['type' => 'text', 'text' => 'H1']]],
        paragraph(['type' => 'text', 'text' => 'a'], ['type' => 'text', 'text' => 'b']),
        ['type' => 'paragraph'],
        ['type' => 'codeBlock', 'content' => [['type' => 'text', 'text' => 'x']]],
    ]);
});

test('link só com http, https ou mailto', function (string $href, bool $kept) {
    $result = sanitize([paragraph(['type' => 'text', 'text' => 'x', 'marks' => [['type' => 'link', 'attrs' => ['href' => $href]]]])]);

    expect(isset($result[0]['content'][0]['marks']))->toBe($kept);
})->with([
    ['https://he4rt.com', true],
    ['http://exemplo.dev/a?b=1', true],
    ['mailto:lia@exemplo.dev', true],
    ['javascript:alert(1)', false],
    ['JAVASCRIPT:alert(1)', false],
    ['data:text/html,<script>', false],
    ['//evil.com', false],
    ['vbscript:x', false],
]);

test('profundidade absurda é cortada', function () {
    $node = paragraph(['type' => 'text', 'text' => 'fundo']);

    for ($i = 0; $i < 40; $i++) {
        $node = ['type' => 'blockquote', 'content' => [$node]];
    }

    $flat = json_encode(sanitize([$node]));

    expect($flat)->not->toContain('fundo');
});
