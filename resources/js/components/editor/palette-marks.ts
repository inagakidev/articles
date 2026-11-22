import { Mark } from '@tiptap/react';

/**
 * Cor de texto e destaque da paleta (RF-068, D58). O artigo guarda só o
 * nome da cor; a classe dá o valor de cada tema, igual no servidor
 * (`Support/Editor/Tiptap`).
 */
export type PaletteColor =
    | 'lavanda'
    | 'rosa'
    | 'amarelo'
    | 'menta'
    | 'azul'
    | 'pessego';

declare module '@tiptap/react' {
    interface Commands<ReturnType> {
        textColor: {
            setTextColor: (color: PaletteColor) => ReturnType;
            unsetTextColor: () => ReturnType;
        };
        paletteHighlight: {
            setPaletteHighlight: (color: PaletteColor) => ReturnType;
            unsetPaletteHighlight: () => ReturnType;
        };
    }
}

function colorAttribute(prefix: string) {
    return {
        color: {
            default: null,
            parseHTML: (element: HTMLElement) =>
                element.getAttribute('data-color'),
            renderHTML: (attributes: { color?: string | null }) =>
                attributes.color
                    ? {
                          'data-color': attributes.color,
                          class: `${prefix}-${attributes.color}`,
                      }
                    : {},
        },
    };
}

export const TextColor = Mark.create({
    name: 'textColor',

    addAttributes() {
        return colorAttribute('article-color');
    },

    parseHTML() {
        return [{ tag: 'span[data-color]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', HTMLAttributes, 0];
    },

    addCommands() {
        return {
            setTextColor:
                (color) =>
                ({ commands }) =>
                    commands.setMark(this.name, { color }),
            unsetTextColor:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name),
        };
    },
});

export const PaletteHighlight = Mark.create({
    name: 'highlight',

    addAttributes() {
        return colorAttribute('article-highlight');
    },

    parseHTML() {
        return [{ tag: 'mark[data-color]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['mark', HTMLAttributes, 0];
    },

    addCommands() {
        return {
            setPaletteHighlight:
                (color) =>
                ({ commands }) =>
                    commands.setMark(this.name, { color }),
            unsetPaletteHighlight:
                () =>
                ({ commands }) =>
                    commands.unsetMark(this.name),
        };
    },
});
