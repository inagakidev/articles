import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Leitura dos tokens de cor e cálculo de contraste para os testes do
 * design system. Os valores vêm sempre dos arquivos reais (CSS, Blade e
 * DESIGN.md), nunca de cópias mantidas no teste.
 */

export type Theme = 'claro' | 'escuro';
export type Tokens = Record<string, string>;

export function readProjectFile(path: string): string {
    return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function readColorVariables(block: string): Tokens {
    const tokens: Tokens = {};

    for (const [, name, value] of block.matchAll(
        /--color-([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi,
    )) {
        tokens[name] = value.toLowerCase();
    }

    return tokens;
}

/** Tokens de cada tema: o escuro herda do claro o que não redefine. */
export function readThemeTokens(css: string): Record<Theme, Tokens> {
    const light = css.match(/@theme\s*\{([\s\S]*?)\n\}/);
    const dark = css.match(/^\.dark\s*\{([\s\S]*?)^\}/m);

    if (!light || !dark) {
        throw new Error('Blocos @theme e .dark não encontrados no CSS.');
    }

    const claro = readColorVariables(light[1]);

    return {
        claro,
        escuro: { ...claro, ...readColorVariables(dark[1]) },
    };
}

function relativeLuminance(hex: string): number {
    const [r, g, b] = [1, 3, 5].map((i) => {
        const channel = parseInt(hex.slice(i, i + 2), 16) / 255;

        return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste da WCAG 2.x, sem arredondamento. */
export function contrastRatio(a: string, b: string): number {
    const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
        (x, y) => y - x,
    );

    return (lighter + 0.05) / (darker + 0.05);
}

function section(markdown: string, start: string, end: string): string {
    const from = markdown.indexOf(start);
    const to = markdown.indexOf(end, from + start.length);

    if (from === -1 || to === -1) {
        throw new Error(`Seção "${start}" não encontrada no DESIGN.md.`);
    }

    return markdown.slice(from, to);
}

const codeValues = (cell: string): string[] =>
    [...cell.matchAll(/`([^`]+)`/g)].map(([, value]) => value);

/**
 * Tokens documentados numa tabela de §2.6 (colunas "Variável CSS" e
 * "Valor"). Linhas como `--color-warning-*` com três valores se referem a
 * bg, on-bg e fg, nessa ordem.
 */
export function readDocumentedTokens(
    markdown: string,
    start: string,
    end: string,
): Tokens {
    const tokens: Tokens = {};

    for (const line of section(markdown, start, end).split('\n')) {
        const cells = line.split('|').map((cell) => cell.trim());
        const names = codeValues(cells[2] ?? '').filter((name) =>
            name.startsWith('--color-'),
        );
        const values = codeValues(cells[3] ?? '');

        if (names.length === 0) {
            continue;
        }

        const expanded =
            names.length === 1 && names[0].endsWith('-*')
                ? ['bg', 'on-bg', 'fg'].map((suffix) =>
                      names[0].replace('*', suffix),
                  )
                : names;

        expanded.forEach((name, index) => {
            tokens[name.replace('--color-', '')] = values[index].toLowerCase();
        });
    }

    return tokens;
}

/** Paleta do editor documentada em §2.11, já com os nomes dos tokens. */
export function readDocumentedEditorPalette(
    markdown: string,
): Record<Theme, Tokens> {
    const palette: Record<Theme, Tokens> = { claro: {}, escuro: {} };
    const table = section(markdown, '### 2.11', '## 3.');

    for (const [
        ,
        name,
        textLight,
        textDark,
        highlightLight,
        highlightDark,
    ] of table.matchAll(
        /^\| `(\w+)`\s*\| `(#\w+)`\s*\| `(#\w+)`\s*\| `(#\w+)`\s*\| `(#\w+)`/gm,
    )) {
        palette.claro[`editor-text-${name}`] = textLight.toLowerCase();
        palette.escuro[`editor-text-${name}`] = textDark.toLowerCase();
        palette.claro[`editor-highlight-${name}`] =
            highlightLight.toLowerCase();
        palette.escuro[`editor-highlight-${name}`] =
            highlightDark.toLowerCase();
    }

    return palette;
}
