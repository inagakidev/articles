import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import Pagination, { pageWindow } from '@/components/ui/pagination';

describe('paginação', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    it.each([
        [1, 12, [1, 2, 3, null, 12]],
        [6, 12, [1, null, 5, 6, 7, null, 12]],
        [12, 12, [1, null, 11, 12]],
        [2, 3, [1, 2, 3]],
    ])('na página %i de %i mostra %j', (current, last, expected) => {
        expect(pageWindow(current, last)).toEqual(expected);
    });

    it('marca a página atual e desativa o que não existe', () => {
        render(<Pagination current={1} last={3} href={(page) => `/p/${page}`} />);

        expect(
            screen.getByRole('link', { name: 'Página 1' }),
        ).toHaveAttribute('aria-current', 'page');
        expect(screen.getByText('Anterior').closest('[aria-disabled]')).not.toBeNull();
        expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute(
            'href',
            '/p/2',
        );
        expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    });

    it('com uma página só, não aparece', () => {
        const { container } = render(
            <Pagination current={1} last={1} href={() => '/'} />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
