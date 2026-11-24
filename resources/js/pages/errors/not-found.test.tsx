import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import NotFound from '@/pages/errors/not-found';

describe('página não encontrada', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    it('explica e oferece o início e as categorias', () => {
        render(<NotFound />);

        expect(
            screen.getByRole('heading', { name: 'Não achamos esta página' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Ir para o início' }),
        ).toHaveAttribute('href', '/');
        expect(
            screen.getByRole('link', { name: 'Ver categorias' }),
        ).toHaveAttribute('href', '/artigos#categorias');
    });

    it('fala em inglês quando o idioma é inglês', () => {
        Object.assign(testPage.props, { locale: 'en' });
        render(<NotFound />);

        expect(
            screen.getByRole('heading', {
                name: 'We could not find this page',
            }),
        ).toBeInTheDocument();
    });
});
