import { describe, expect, it } from 'vitest';
import en from '../../../lang/en.json';
import ptBR from '../../../lang/pt_BR.json';
import { translate } from '@/lib/i18n';

const placeholders = (text: string) =>
    [...text.matchAll(/:(\w+)/g)].map(([, name]) => name).sort();

describe('traduções', () => {
    it('português e inglês têm as mesmas chaves', () => {
        expect(Object.keys(en).sort()).toEqual(Object.keys(ptBR).sort());
    });

    it.each(Object.keys(ptBR) as (keyof typeof ptBR)[])(
        '"%s" tem texto e os mesmos valores nos dois idiomas',
        (key) => {
            expect(ptBR[key].trim()).not.toBe('');
            expect(en[key].trim()).not.toBe('');
            expect(placeholders(en[key])).toEqual(placeholders(ptBR[key]));
        },
    );

    it('usa o idioma pedido e substitui os valores', () => {
        expect(
            translate('en', 'theme.toggle', { current: 'light', next: 'dark' }),
        ).toBe('Theme: light. Switch to dark');
        expect(
            translate('pt_BR', 'theme.toggle', {
                current: 'claro',
                next: 'escuro',
            }),
        ).toBe('Tema: claro. Mudar para escuro');
    });
});
