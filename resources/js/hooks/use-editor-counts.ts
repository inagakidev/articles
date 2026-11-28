import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { needsAlt } from '@/components/editor/image-alt-field';
export type Counts = {
    words: number;
    characters: number;
    empty: boolean;
    images: number;
    missingAlt: number;
};

export function countsOf(editor: Editor): Counts {
    return {
        words: editor.storage.characterCount.words() as number,
        characters: editor.storage.characterCount.characters() as number,
        empty: editor.isEmpty,
        ...imageCounts(editor),
    };
}

/**
 * Contagens do texto, refeitas a cada mudança. Lê o editor atual, e não um
 * retrato guardado: no StrictMode o Tiptap cria o editor duas vezes, e o
 * `useEditorState` ficava preso ao primeiro (zerado) até a primeira edição.
 */
export function useEditorCounts(editor: Editor | null): Counts {
    const [counts, setCounts] = useState<Counts>({
        words: 0,
        characters: 0,
        empty: true,
        images: 0,
        missingAlt: 0,
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const update = () => setCounts(countsOf(editor));
        update();
        editor.on('update', update);

        return () => {
            editor.off('update', update);
        };
    }, [editor]);

    return counts;
}

/** Quantas imagens o texto tem e quantas ainda sem texto alternativo. */
export function imageCounts(editor: Editor | null) {
    let images = 0;
    let missingAlt = 0;

    editor?.state.doc.descendants((node) => {
        if (node.type.name === 'image') {
            images += 1;

            if (
                needsAlt(
                    node.attrs.alt as string | null,
                    node.attrs.decorative === true,
                )
            ) {
                missingAlt += 1;
            }
        }
    });

    return { images, missingAlt };
}
