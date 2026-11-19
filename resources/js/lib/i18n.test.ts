import { describe, expect, it } from 'vite-plus/test';
import en from '../../../lang/en.json';
import ptBR from '../../../lang/pt_BR.json';
import { traduzir } from '@/lib/i18n';

const placeholders = (texto: string) =>
    [...texto.matchAll(/:(\w+)/g)].map(([, nome]) => nome).sort();

describe('traduções', () => {
    it('português e inglês têm as mesmas chaves', () => {
        expect(Object.keys(en).sort()).toEqual(Object.keys(ptBR).sort());
    });

    it.each(Object.keys(ptBR) as (keyof typeof ptBR)[])(
        '"%s" tem texto e os mesmos valores nos dois idiomas',
        (chave) => {
            expect(ptBR[chave].trim()).not.toBe('');
            expect(en[chave].trim()).not.toBe('');
            expect(placeholders(en[chave])).toEqual(placeholders(ptBR[chave]));
        },
    );

    it('usa o idioma pedido e substitui os valores', () => {
        expect(
            traduzir('en', 'theme.toggle', { current: 'light', next: 'dark' }),
        ).toBe('Theme: light. Switch to dark');
        expect(
            traduzir('pt_BR', 'theme.toggle', {
                current: 'claro',
                next: 'escuro',
            }),
        ).toBe('Tema: claro. Mudar para escuro');
    });
});
