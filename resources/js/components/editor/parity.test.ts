import { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vite-plus/test';
import { editorExtensions } from '@/components/editor/extensions';
import fixture from '../../../../tests/Fixtures/editor/parity.json';

/*
 * Paridade com o servidor (D51): os mesmos documentos são verificados no
 * Pest (`tests/Unit/Editor/ParityTest.php`).
 */

/** Valores padrão do Tiptap que o servidor não guarda. */
const DEFAULTS: Record<string, unknown> = {
    textAlign: null,
    start: 1,
    type: null,
    colspan: 1,
    rowspan: 1,
    colwidth: null,
    align: null,
    alt: null,
    caption: null,
    decorative: false,
    language: null,
};

/** Atributos de apresentação do link: o servidor guarda só o endereço. */
const PRESENTATIONAL = ['target', 'rel', 'class', 'title'];

type Json = {
    type: string;
    attrs?: Record<string, unknown>;
    content?: Json[];
    marks?: Json[];
    text?: string;
};

function withoutDefaults(node: Json): Json {
    const attrs = Object.fromEntries(
        Object.entries(node.attrs ?? {}).filter(
            ([key, value]) =>
                !PRESENTATIONAL.includes(key) &&
                (!(key in DEFAULTS) ||
                    (value !== DEFAULTS[key] &&
                        !(key === 'textAlign' && value === 'left'))),
        ),
    );
    const clean: Json = { type: node.type };

    if (Object.keys(attrs).length > 0) clean.attrs = attrs;
    if (node.text !== undefined) clean.text = node.text;
    if (node.marks) clean.marks = node.marks.map(withoutDefaults);
    if (node.content) clean.content = node.content.map(withoutDefaults);

    return clean;
}

function editorWith(content?: unknown) {
    return new Editor({
        extensions: editorExtensions({
            placeholder: '',
            characterLimit: 50000,
        }),
        content: content as Json | undefined,
    });
}

describe('paridade do editor com o servidor', () => {
    it('o editor tem exatamente os nós e marcas que o servidor aceita', () => {
        const { schema } = editorWith();

        expect(Object.keys(schema.nodes).sort()).toEqual(
            [...fixture.nodes].sort(),
        );
        expect(Object.keys(schema.marks).sort()).toEqual(
            [...fixture.marks].sort(),
        );
    });

    it.each(Object.entries(fixture.documents))(
        '%s: o editor lê e devolve o mesmo documento',
        (_, document) => {
            const editor = editorWith(document);

            expect(withoutDefaults(editor.getJSON() as Json)).toEqual(document);
            editor.destroy();
        },
    );
});
