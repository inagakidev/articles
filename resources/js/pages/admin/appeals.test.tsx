import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import '@/test/inertia';
import Appeals from '@/pages/admin/appeals';

const appeal = {
    id: 9,
    status: 'open' as const,
    body: 'Os links eram da documentação oficial.',
    sentAt: '2026-11-15T10:00:00Z',
    decisionReason: null,
    decidedBy: null,
    decidedAt: null,
    user: { name: 'Theo Nunes', username: 'theo-nunes', avatar: null },
    penalty: {
        type: 'suspension' as const,
        until: '2026-11-21T10:00:00Z',
        policyItem: '1.2',
        reason: 'Três artigos com links de afiliado sem aviso.',
        appliedBy: 'Amanda',
        startsAt: '2026-11-14T10:00:00Z',
    },
};

const page = (data: (typeof appeal)[]) => ({
    data,
    currentPage: 1,
    lastPage: 1,
    total: data.length,
});

describe('contestações no painel', () => {
    it('mostra a penalidade original, a contestação e o efeito de aceitar', () => {
        render(
            <Appeals
                filters={{ status: 'open' }}
                openCount={1}
                appeals={page([appeal])}
            />,
        );

        const card = screen.getByRole('region', { name: /Theo Nunes/ });
        expect(card).toHaveTextContent(
            'Três artigos com links de afiliado sem aviso.',
        );
        expect(card).toHaveTextContent(
            'Os links eram da documentação oficial.',
        );

        fireEvent.click(
            screen.getByRole('radio', {
                name: 'Aceitar e anular a penalidade',
            }),
        );
        expect(card).toHaveTextContent('a conta volta na hora');
        expect(
            screen.getByRole('button', { name: 'Aceitar contestação' }),
        ).toBeEnabled();

        fireEvent.click(screen.getByRole('radio', { name: 'Rejeitar' }));
        expect(
            screen.getByRole('button', { name: 'Rejeitar contestação' }),
        ).toBeEnabled();
    });

    it('sem contestações, o estado vazio', () => {
        render(
            <Appeals
                filters={{ status: 'open' }}
                openCount={0}
                appeals={page([])}
            />,
        );

        expect(
            screen.getByText('Nenhuma contestação aqui'),
        ).toBeInTheDocument();
    });
});
