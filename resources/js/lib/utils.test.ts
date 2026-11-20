import { describe, expect, it } from 'vite-plus/test';
import { cn } from '@/lib/utils';

describe('cn', () => {
    it('mantém juntos um tamanho de texto do DESIGN e uma cor', () => {
        expect(cn('text-text-on-primary', 'text-body')).toBe(
            'text-text-on-primary text-body',
        );
    });

    it('o último tamanho de texto vence', () => {
        expect(cn('text-meta', 'text-body')).toBe('text-body');
    });
});
