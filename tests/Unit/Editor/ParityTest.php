<?php

use App\Support\Editor\DocumentSanitizer;
use App\Support\Editor\EditorSchema;

/*
 * Paridade com o editor (D51): os mesmos documentos são verificados no
 * Vitest (`components/editor/parity.test.ts`). Tudo o que o Tiptap produz
 * chega ao banco sem mudança.
 */

function parityFixture(): array
{
    return json_decode((string) file_get_contents(__DIR__.'/../../Fixtures/editor/parity.json'), true);
}

test('o esquema do servidor tem os mesmos nós e marcas do editor', function () {
    $fixture = parityFixture();

    expect(array_keys(EditorSchema::NODES))->toBe($fixture['nodes'])
        ->and(EditorSchema::MARKS)->toBe($fixture['marks']);
});

test('documentos do editor passam pela limpeza sem mudança', function (string $name) {
    $document = parityFixture()['documents'][$name];

    expect((new DocumentSanitizer)->sanitize($document))->toBe($document);
})->with(['todos os elementos', 'vazio']);
