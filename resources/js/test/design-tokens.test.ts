import { describe, expect, it } from 'vite-plus/test';
import type { Theme } from './design-tokens';
import {
    contrastRatio,
    readAuditTable,
    readDocumentedEditorPalette,
    readDocumentedPastels,
    readDocumentedTokens,
    readProjectFile,
    readThemeTokens,
    solidOver,
} from './design-tokens';

const css = readProjectFile('resources/css/app.css');
const design = readProjectFile('docs/DESIGN.md');
const tokens = readThemeTokens(css);
const themes: Theme[] = ['claro', 'escuro'];

/** Mínimos da WCAG 2.2 AA: 1.4.3 (texto) e 1.4.11 (componentes e foco). */
const TEXT = 4.5;
const UI = 3;

type Pair = {
    foreground: string;
    backgrounds: string[];
    minimum: number;
    /** Fundo translúcido: o contraste é medido sobre cada uma destas superfícies. */
    over?: string[];
};

const surfaces = [
    'bg',
    'surface',
    'surface-elevated',
    'surface-muted',
    'surface-hover',
    'surface-selected',
];
const editorColors = ['lavanda', 'rosa', 'amarelo', 'menta', 'azul', 'pessego'];
const pastels = [
    'lavender',
    'lilac',
    'mint',
    'yellow',
    'pink',
    'blue',
    'peach',
];
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
        // Tags, categorias e capas: cada pastel com o texto do seu par (D63)
        ...pastels.map((pastel) => ({
            foreground: `pastel-${pastel}-fg`,
            backgrounds: [`pastel-${pastel}`],
            minimum: TEXT,
        })),
        // Avisos grandes: translúcidos no escuro, medidos sobre as superfícies em que aparecem
        ...states.map((state) => ({
            foreground: `tint-${state}-fg`,
            backgrounds: [`tint-${state}-bg`],
            minimum: TEXT,
            over: ['bg', 'surface', 'surface-elevated'],
        })),
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
    const token = (name: string) => {
        const value = tokens[theme][name];

        if (!value) {
            throw new Error(`Token ausente no tema ${theme}: ${name}`);
        }

        return value;
    };

    return usagePairs(theme).flatMap(
        ({ foreground, backgrounds, minimum, over = [undefined] }) =>
            backgrounds.flatMap((background) =>
                over.map((base) => {
                    const bg = base
                        ? solidOver(token(background), token(base))
                        : token(background);
                    const ratio = contrastRatio(token(foreground), bg);
                    const where = base ? ` (sobre ${base})` : '';

                    return {
                        name: `${foreground} sobre ${background}${where}: ${ratio.toFixed(2)}:1 (mínimo ${minimum}:1)`,
                        ratio,
                        minimum,
                    };
                }),
            ),
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

    it('pares de pastel (§2.7), iguais nos dois temas', () => {
        const documented = readDocumentedPastels(design);

        expect(Object.keys(documented)).toHaveLength(pastels.length * 2);

        for (const [name, value] of Object.entries(documented)) {
            for (const theme of themes) {
                expect({ theme, name, value: tokens[theme][name] }).toEqual({
                    theme,
                    name,
                    value,
                });
            }
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

describe('auditoria de contraste do DESIGN.md (§2.9)', () => {
    const rows = readAuditTable(design);

    it('lê todas as linhas da tabela', () => {
        expect(rows.length).toBeGreaterThanOrEqual(90);
    });

    it.each(rows)('$id: a razão escrita bate com as cores da linha', (row) => {
        expect(contrastRatio(row.foreground, row.background).toFixed(2)).toBe(
            row.documentedRatio.toFixed(2),
        );
    });

    it.each(rows.filter((row) => row.result === 'Aprovado'))(
        '$id: o par aprovado passa no critério',
        (row) => {
            expect(row.minimum).not.toBeNull();
            expect(
                contrastRatio(row.foreground, row.background),
            ).toBeGreaterThanOrEqual(row.minimum!);
        },
    );

    // Se uma cor mudar e o uso proibido passar a ser aceitável, a restrição precisa ser revista no DESIGN.md
    it.each(rows.filter((row) => row.forbidden))(
        '$id †: o uso proibido continua abaixo do critério',
        (row) => {
            expect(row.minimum).not.toBeNull();
            expect(contrastRatio(row.foreground, row.background)).toBeLessThan(
                row.minimum!,
            );
        },
    );
});
