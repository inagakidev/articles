#!/usr/bin/env node
/**
 * Valida mensagens de commit conforme o CONTRIBUTING.md.
 *
 *   node scripts/commit-message.mjs <arquivo>      # hook commit-msg
 *   node scripts/commit-message.mjs --range a..b   # CI: commits de um PR
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const tipos = [
    'feat',
    'fix',
    'refactor',
    'perf',
    'test',
    'docs',
    'style',
    'build',
    'ci',
    'chore',
    'revert',
];

export const escopos = [
    'auth',
    'users',
    'profile',
    'articles',
    'editor',
    'media',
    'categories',
    'tags',
    'moderation',
    'comments',
    'likes',
    'favorites',
    'reports',
    'notifications',
    'admin',
    'audit',
    'search',
    'i18n',
    'theme',
    'db',
    'deps',
    'config',
];

const LIMITE = 72;
const vagas = [
    'ajustes',
    'ajuste',
    'melhorias',
    'wip',
    'update',
    'updates',
    'correções',
    'correções diversas',
];
const cabecalho =
    /^(?<tipo>[a-z]+)(?:\((?<escopo>[a-z0-9-]+)\))?(?<quebra>!)?: (?<descricao>.+)$/;
const idDoRoadmap = /\b(p\d+-\d+|fase\s+0?\d+)\b/i;

/** Mensagens que o git gera sozinho não seguem o formato. */
const geradaPeloGit = (linha) =>
    /^(Merge |Revert "|fixup! |squash! )/.test(linha);

/** Devolve a lista de problemas da mensagem (vazia quando está correta). */
export function validarMensagem(mensagem) {
    const linhas = mensagem
        .split('\n')
        .filter((linha) => !linha.startsWith('#'))
        .map((linha) => linha.replace(/\s+$/, ''));

    while (linhas.length && linhas[linhas.length - 1] === '') {
        linhas.pop();
    }

    const [primeira = '', segunda] = linhas;

    if (geradaPeloGit(primeira)) {
        return [];
    }

    const problemas = [];
    const partes = cabecalho.exec(primeira)?.groups;

    if (!partes) {
        return [
            'A primeira linha deve seguir "tipo(escopo): descrição", com o escopo opcional.',
        ];
    }

    if (!tipos.includes(partes.tipo)) {
        problemas.push(
            `Tipo "${partes.tipo}" não existe. Use um de: ${tipos.join(', ')}.`,
        );
    }

    if (partes.escopo && !escopos.includes(partes.escopo)) {
        problemas.push(
            `Escopo "${partes.escopo}" não existe. Use um de: ${escopos.join(', ')}, ou omita.`,
        );
    }

    if (primeira.length > LIMITE) {
        problemas.push(
            `A primeira linha tem ${primeira.length} caracteres; o limite é ${LIMITE}.`,
        );
    }

    const descricao = partes.descricao;

    if (/^\p{Lu}/u.test(descricao)) {
        problemas.push('A descrição começa em minúscula.');
    }

    if (descricao.endsWith('.')) {
        problemas.push('A descrição não termina com ponto final.');
    }

    if (vagas.includes(descricao.toLowerCase())) {
        problemas.push(`"${descricao}" é vago: diga o que mudou.`);
    }

    if (idDoRoadmap.test(linhas.join('\n'))) {
        problemas.push(
            'A mensagem não cita fases nem tarefas do roadmap; descreva a mudança.',
        );
    }

    if (segunda !== undefined && segunda !== '') {
        problemas.push(
            'Deixe uma linha em branco entre a descrição e o corpo.',
        );
    }

    return problemas;
}

function relatar(rotulo, problemas) {
    console.error(`✗ ${rotulo}`);
    problemas.forEach((problema) => console.error(`  - ${problema}`));
}

function principal(argumentos) {
    if (argumentos[0] === '--range') {
        const saida = execFileSync(
            'git',
            ['log', '--format=%h%x00%B%x1e', argumentos[1]],
            { encoding: 'utf8' },
        );
        let falhas = 0;

        for (const registro of saida
            .split('\x1e')
            .map((r) => r.trim())
            .filter(Boolean)) {
            const [hash, mensagem] = registro.split('\0');
            const problemas = validarMensagem(mensagem);

            if (problemas.length) {
                falhas++;
                relatar(`${hash} ${mensagem.split('\n')[0]}`, problemas);
            }
        }

        return falhas ? 1 : 0;
    }

    const problemas = validarMensagem(readFileSync(argumentos[0], 'utf8'));

    if (problemas.length) {
        relatar(
            'Mensagem de commit fora do padrão (CONTRIBUTING.md):',
            problemas,
        );

        return 1;
    }

    return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    process.exit(principal(process.argv.slice(2)));
}
