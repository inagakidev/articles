import { describe, expect, it } from 'vitest';
import type { Theme } from './design-tokens';
import {
    contrastRatio,
    readDocumentedEditorPalette,
    readDocumentedTokens,
    readProjectFile,
    readThemeTokens,
} from './design-tokens';

const css = readProjectFile('resources/css/app.css');
const design = readProjectFile('docs/DESIGN.md');
const tokens = readThemeTokens(css);
const themes: Theme[] = ['claro', 'escuro'];

/** Mínimos da WCAG 2.2 AA: 1.4.3 (texto) e 1.4.11 (componentes e foco). */
const TEXT = 4.5;
const UI = 3;

type Pair = { foreground: string; backgrounds: string[]; minimum: number };

const surfaces = [
    'bg',
    'surface',
    'surface-elevated',
    'surface-muted',
    'surface-hover',
    'surface-selected',
];
const editorColors = ['lavanda', 'rosa', 'amarelo', 'menta', 'azul', 'pessego'];
const tags = ['lavender', 'pink', 'yellow', 'mint', 'blue', 'peach'];
const states = ['success', 'warning', 'danger', 'info'];

/** Pares de uso permitidos pelo DESIGN.md (§2.7, §2.8 e §2.11). */
function usagePairs(theme: Theme): Pair[] {
    return [
        { foreground: 'text-primary', backgrounds: surfaces, minimum: TEXT },
        // muted-foreground do shadcn aponta para text-secondary e aparece em qualquer superfície
        { foreground: 'text-secondary', backgrounds: surfaces, minimum: TEXT },
        // text-muted é restrito: no claro, só sobre bg e surface (§2.7)
        {
            foreground: 'text-muted',
            backgrounds:
                theme === 'claro'
                    ? ['bg', 'surface']
                    : ['bg', 'surface', 'surface-elevated', 'surface-muted'],
            minimum: TEXT,
        },
        { foreground: 'primary-text', backgrounds: surfaces, minimum: TEXT },
        {
            foreground: 'text-on-primary',
            backgrounds: ['primary', 'primary-hover', 'primary-active'],
            minimum: TEXT,
        },
        {
            foreground: 'text-on-selected',
            backgrounds: ['surface-selected'],
            minimum: TEXT,
        },
        ...states.flatMap((state) => [
            {
                foreground: `${state}-on-bg`,
                backgrounds: [`${state}-bg`],
                minimum: TEXT,
            },
            {
                foreground: `${state}-fg`,
                backgrounds: ['bg', 'surface', 'surface-elevated'],
                minimum: TEXT,
            },
        ]),
        {
            foreground: 'tag-text',
            backgrounds: tags.map((tag) => `tag-${tag}`),
            minimum: TEXT,
        },
        {
            foreground: 'border-strong',
            backgrounds: ['bg', 'surface', 'surface-elevated', 'surface-muted'],
            minimum: UI,
        },
        {
            foreground: 'focus',
            backgrounds: [
                'bg',
                'surface',
                'surface-elevated',
                'surface-selected',
            ],
            minimum: UI,
        },
        // Primário como componente: checkbox marcado, página atual da paginação
        {
            foreground: 'primary',
            backgrounds: ['bg', 'surface', 'surface-elevated'],
            minimum: UI,
        },
        ...editorColors.map((color) => ({
            foreground: `editor-text-${color}`,
            backgrounds: ['bg', 'surface'],
            minimum: TEXT,
        })),
        {
            foreground: 'editor-highlight-text',
            backgrounds: editorColors.map(
                (color) => `editor-highlight-${color}`,
            ),
            minimum: TEXT,
        },
        // Texto colorido dentro de destaque: as 36 combinações são permitidas (§2.11)
        ...editorColors.map((color) => ({
            foreground: `editor-text-${color}`,
            backgrounds: editorColors.map(
                (highlight) => `editor-highlight-${highlight}`,
            ),
            minimum: TEXT,
        })),
    ];
}

function cases(theme: Theme) {
    return usagePairs(theme).flatMap(({ foreground, backgrounds, minimum }) =>
        backgrounds.map((background) => {
            const fg = tokens[theme][foreground];
            const bg = tokens[theme][background];

            if (!fg || !bg) {
                throw new Error(
                    `Token ausente no tema ${theme}: ${fg ? background : foreground}`,
                );
            }

            const ratio = contrastRatio(fg, bg);

            return {
                name: `${foreground} sobre ${background}: ${ratio.toFixed(2)}:1 (mínimo ${minimum}:1)`,
                ratio,
                minimum,
            };
        }),
    );
}

describe.each(themes)('contraste dos tokens no tema %s', (theme) => {
    it.each(cases(theme))('$name', ({ ratio, minimum }) => {
        expect(ratio).toBeGreaterThanOrEqual(minimum);
    });
});

describe('DESIGN.md e CSS têm os mesmos valores', () => {
    const documented: Record<Theme, Record<string, string>> = {
        claro: readDocumentedTokens(design, '#### 2.6.1', '#### 2.6.2'),
        escuro: readDocumentedTokens(design, '#### 2.6.2', '#### 2.6.3'),
    };
    const editor = readDocumentedEditorPalette(design);

    it.each(themes)('tokens semânticos do tema %s (§2.6)', (theme) => {
        expect(Object.keys(documented[theme]).length).toBeGreaterThan(20);

        for (const [name, value] of Object.entries(documented[theme])) {
            expect({ name, value: tokens[theme][name] }).toEqual({
                name,
                value,
            });
        }
    });

    it.each(themes)('paleta do editor no tema %s (§2.11)', (theme) => {
        expect(Object.keys(editor[theme])).toHaveLength(12);

        for (const [name, value] of Object.entries(editor[theme])) {
            expect({ name, value: tokens[theme][name] }).toEqual({
                name,
                value,
            });
        }
    });

    it('fundo pintado pelo Blade antes do CSS é o --color-bg de cada tema', () => {
        const blade = readProjectFile('resources/views/app.blade.php');
        const light = blade.match(/html\s*\{\s*background-color:\s*(#\w+)/);
        const dark = blade.match(
            /html\.dark\s*\{\s*background-color:\s*(#\w+)/,
        );

        expect(light?.[1].toLowerCase()).toBe(tokens.claro.bg);
        expect(dark?.[1].toLowerCase()).toBe(tokens.escuro.bg);
    });
});
