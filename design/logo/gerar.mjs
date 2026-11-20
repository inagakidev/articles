/**
 * Separa as variações da logo a partir da prancha (logos.svg) e gera os
 * ícones do navegador.
 *
 * Uso:
 *     node design/logo/gerar.mjs <caminho da prancha logos.svg>
 *
 * A prancha fica fora do repositório (ver LEIA-ME.md). Os elementos são
 * escolhidos pela posição na prancha; se ela mudar de ordem, ajuste VARIANTS.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const output = resolve(root, 'resources/images/logo');
const publicDir = resolve(root, 'public');

// Linha "ícone + nome, sem tagline" da prancha: corpo, dobra, coração, "he4rt", "ink".
const COMPACT = [34, 35, 36, 37, 38];
// Mesma linha com as cores do tema escuro, tiradas da variação branca da prancha.
const ON_DARK = ['#FFFFFF', '#DCCBFF', '#451F75', '#FFFFFF', '#DCCBFF'];

const VARIANTS = {
    'icon-light': { elements: COMPACT.slice(0, 3) },
    'icon-dark': { elements: COMPACT.slice(0, 3), fills: ON_DARK },
    'wordmark-light': { elements: COMPACT },
    'wordmark-dark': { elements: COMPACT, fills: ON_DARK },
    // Com a tagline "he4rt developers", para o rodapé.
    'wordmark-full-light': { elements: [28, 29, 30, 31, 32, 33] },
    'wordmark-full-dark': { elements: [7, 8, 9, 10, 11, 12] },
};

const board = process.argv[2];
if (!board) {
    console.error('Uso: node design/logo/gerar.mjs <logos.svg>');
    process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(readFileSync(board, 'utf8'));

mkdirSync(output, { recursive: true });

for (const [name, { elements, fills }] of Object.entries(VARIANTS)) {
    const svg = await page.evaluate(
        ([indexes, colors]) => {
            const children = [...document.querySelector('svg').children];
            const nodes = indexes.map((index) => children[index]);
            const boxes = nodes.map((node) => node.getBBox());
            const x = Math.floor(Math.min(...boxes.map((b) => b.x)));
            const y = Math.floor(Math.min(...boxes.map((b) => b.y)));
            const right = Math.ceil(Math.max(...boxes.map((b) => b.x + b.width)));
            const bottom = Math.ceil(Math.max(...boxes.map((b) => b.y + b.height)));

            const paths = nodes.map((node, i) => {
                const copy = node.cloneNode(true);
                if (colors) {
                    copy.setAttribute('fill', colors[i]);
                    copy.removeAttribute('fill-opacity');
                }
                return copy.outerHTML;
            });

            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${right - x} ${bottom - y}" fill="none"><g transform="translate(${-x} ${-y})">${paths.join('')}</g></svg>`;
        },
        [elements, fills],
    );

    writeFileSync(resolve(output, `${name}.svg`), `${svg}\n`);
    console.log(`resources/images/logo/${name}.svg`);
}

const icon = readFileSync(resolve(output, 'icon-light.svg'), 'utf8');
writeFileSync(resolve(publicDir, 'favicon.svg'), icon);

async function renderPng(size, padding = 0, background = 'transparent') {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
        `<body style="margin:0;background:${background};display:grid;place-items:center;width:${size}px;height:${size}px">` +
            icon.replace('<svg ', `<svg width="${size - padding * 2}" `) +
            '</body>',
    );
    return page.screenshot({ omitBackground: background === 'transparent' });
}

// O .ico guarda PNGs (aceito por todos os navegadores atuais) de 16, 32 e 48 px.
const sizes = [16, 32, 48];
const images = [];
for (const size of sizes) images.push(await renderPng(size));

const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(images[i].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += images[i].length;
});
writeFileSync(resolve(publicDir, 'favicon.ico'), Buffer.concat([header, ...images]));

// O iOS não aceita transparência: o ícone vai sobre o fundo creme da marca.
writeFileSync(
    resolve(publicDir, 'apple-touch-icon.png'),
    await renderPng(180, 20, '#FFFDF8'),
);
console.log('public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png');

await browser.close();
