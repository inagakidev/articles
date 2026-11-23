import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { CharacterCount, Placeholder } from '@tiptap/extensions';
import StarterKit from '@tiptap/starter-kit';
import { ArticleImage } from '@/components/editor/article-image';
import { PaletteHighlight, TextColor } from '@/components/editor/palette-marks';

/**
 * As extensões do editor: só as previstas (RF-066 a RF-069, D51). O
 * servidor aceita o mesmo esquema (`EditorSchema`) e descarta o resto.
 */
export function editorExtensions({
    placeholder,
    characterLimit,
    images = { resolve: () => undefined, textMax: 250 },
}: {
    placeholder: string;
    characterLimit: number;
    /** De onde vem o endereço de cada imagem já enviada (RF-080). */
    images?: { resolve: (id: string) => string | undefined; textMax: number };
}) {
    return [
        StarterKit.configure({
            // O nível 1 é o título do artigo
            heading: { levels: [2, 3] },
            // Sublinhado não existe, para não confundir com link (RF-066)
            underline: false,
            strike: false,
            link: {
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                protocols: ['http', 'https', 'mailto'],
                isAllowedUri: (url) => /^(https?:\/\/|mailto:)/i.test(url),
                HTMLAttributes: { rel: 'nofollow ugc noopener', target: null },
            },
            codeBlock: { languageClassPrefix: 'language-' },
        }),
        TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right'],
        }),
        TableKit.configure({ table: { resizable: false } }),
        TextColor,
        PaletteHighlight,
        ArticleImage.configure(images),
        Placeholder.configure({ placeholder }),
        CharacterCount.configure({ limit: characterLimit }),
    ];
}
