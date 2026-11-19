import { describe, expect, it } from 'vitest';
import { validateMessage } from './commit-message.mjs';

describe('validação da message de commit', () => {
    it.each([
        'feat(auth): exige verificação de e-mail para publicar artigos',
        'fix: corrige contraste da dica do editor vazio',
        'refactor(db)!: troca a collation das tabelas',
        'docs: registra as decisões\n\nCorpo explicando o motivo.\n\nRefs: D63',
        'Merge pull request #4 from inagakidev/feat/base-telas',
        'Revert "feat: adiciona algo"',
    ])('aceita "%s"', (message) => {
        expect(validateMessage(message)).toEqual([]);
    });

    it.each([
        ['Adiciona login', 'tipo(escopo): descrição'],
        ['feature: adiciona login', 'Tipo "feature" não existe'],
        ['feat(login): adiciona tela', 'Escopo "login" não existe'],
        ['feat: Adiciona tela de login', 'começa em minúscula'],
        ['feat: adiciona tela de login.', 'ponto final'],
        ['fix: ajustes', 'vago'],
        ['feat: conclui a fase 02', 'roadmap'],
        ['chore: setup inicial p2-01', 'roadmap'],
        [
            'docs: registra decisões\ncorpo sem line em branco',
            'linha em branco',
        ],
        [`docs(editor): ${'x'.repeat(60)}`, 'o limite é 72'],
    ])('recusa "%s"', (message, problem) => {
        expect(validateMessage(message).join(' ')).toContain(problem);
    });

    it('ignora as lines de comentário que o git acrescenta', () => {
        expect(
            validateMessage(
                'fix: corrige o rodapé\n# Please enter the commit message',
            ),
        ).toEqual([]);
    });
});
