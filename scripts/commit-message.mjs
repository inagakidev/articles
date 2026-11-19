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

export const types = [
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

export const scopes = [
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

const MAX_HEADER_LENGTH = 72;
const vagueDescriptions = [
    'ajustes',
    'ajuste',
    'melhorias',
    'wip',
    'update',
    'updates',
    'correções',
    'correções diversas',
];
const header =
    /^(?<type>[a-z]+)(?:\((?<scope>[a-z0-9-]+)\))?(?<breaking>!)?: (?<description>.+)$/;
const roadmapReference = /\b(p\d+-\d+|fase\s+0?\d+)\b/i;

/** Mensagens que o git gera sozinho não seguem o formato. */
const isGitGenerated = (line) =>
    /^(Merge |Revert "|fixup! |squash! )/.test(line);

/** Devolve a lista de problems da message (vazia quando está correta). */
export function validateMessage(message) {
    const lines = message
        .split('\n')
        .filter((line) => !line.startsWith('#'))
        .map((line) => line.replace(/\s+$/, ''));

    while (lines.length && lines[lines.length - 1] === '') {
        lines.pop();
    }

    const [first = '', second] = lines;

    if (isGitGenerated(first)) {
        return [];
    }

    const problems = [];
    const parts = header.exec(first)?.groups;

    if (!parts) {
        return [
            'A primeira linha deve seguir "tipo(escopo): descrição", com o escopo opcional.',
        ];
    }

    if (!types.includes(parts.type)) {
        problems.push(
            `Tipo "${parts.type}" não existe. Use um de: ${types.join(', ')}.`,
        );
    }

    if (parts.scope && !scopes.includes(parts.scope)) {
        problems.push(
            `Escopo "${parts.scope}" não existe. Use um de: ${scopes.join(', ')}, ou omita.`,
        );
    }

    if (first.length > MAX_HEADER_LENGTH) {
        problems.push(
            `A primeira linha tem ${first.length} caracteres; o limite é ${MAX_HEADER_LENGTH}.`,
        );
    }

    const description = parts.description;

    if (/^\p{Lu}/u.test(description)) {
        problems.push('A descrição começa em minúscula.');
    }

    if (description.endsWith('.')) {
        problems.push('A descrição não termina com ponto final.');
    }

    if (vagueDescriptions.includes(description.toLowerCase())) {
        problems.push(`"${description}" é vago: diga o que mudou.`);
    }

    if (roadmapReference.test(lines.join('\n'))) {
        problems.push(
            'A mensagem não cita fases nem tarefas do roadmap; descreva a mudança.',
        );
    }

    if (second !== undefined && second !== '') {
        problems.push('Deixe uma linha em branco entre a descrição e o corpo.');
    }

    return problems;
}

function report(label, problems) {
    console.error(`✗ ${label}`);
    problems.forEach((problem) => console.error(`  - ${problem}`));
}

function main(args) {
    if (args[0] === '--range') {
        const output = execFileSync(
            'git',
            ['log', '--format=%h%x00%B%x1e', args[1]],
            { encoding: 'utf8' },
        );
        let failures = 0;

        for (const entry of output
            .split('\x1e')
            .map((r) => r.trim())
            .filter(Boolean)) {
            const [hash, message] = entry.split('\0');
            const problems = validateMessage(message);

            if (problems.length) {
                failures++;
                report(`${hash} ${message.split('\n')[0]}`, problems);
            }
        }

        return failures ? 1 : 0;
    }

    const problems = validateMessage(readFileSync(args[0], 'utf8'));

    if (problems.length) {
        report(
            'Mensagem de commit fora do padrão (CONTRIBUTING.md):',
            problems,
        );

        return 1;
    }

    return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    process.exit(main(process.argv.slice(2)));
}
