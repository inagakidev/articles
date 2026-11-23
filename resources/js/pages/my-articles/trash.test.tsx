import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import Trash from '@/pages/my-articles/trash';

describe('Lixeira', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    it('lista o que pode voltar e quanto tempo falta', () => {
        const day = 86_400_000;
        render(
            <Trash
                trashDays={7}
                articles={[
                    {
                        id: 4,
                        title: 'Git rebase sem pânico',
                        deletedAt: new Date(Date.now() - 2 * day).toISOString(),
                        restorableUntil: new Date(
                            Date.now() + 5 * day - 60_000,
                        ).toISOString(),
                    },
                ]}
            />,
        );

        expect(
            screen.getByText(/restaurável por mais 5 dias/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Restaurar Git rebase sem pânico',
            }),
        ).toBeInTheDocument();
    });

    it('vazia, diz por quanto tempo os excluídos ficam', () => {
        render(<Trash trashDays={7} articles={[]} />);

        expect(screen.getByText('A lixeira está vazia')).toBeInTheDocument();
    });
});
