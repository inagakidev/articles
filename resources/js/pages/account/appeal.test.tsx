import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { testForm } from '@/test/inertia';
import Appeal from '@/pages/account/appeal';

const props = {
    penaltyId: 3,
    type: 'suspension' as const,
    policyItem: '1.2',
    reason: 'Três artigos com links de afiliado sem aviso.',
    endsAt: '2026-11-21T18:00:00Z',
    deadline: '2026-11-21T10:00:00Z',
    alreadyAppealed: false,
    open: true,
    submitUrl: '/contestar/3?signature=abc',
};

describe('contestar', () => {
    it('mostra a penalidade, pede o texto e mostra os erros no campo', () => {
        testForm.errors = {
            justification: 'O texto precisa de pelo menos 20 caracteres.',
        };
        render(<Appeal {...props} />);

        expect(
            screen.getByText('Três artigos com links de afiliado sem aviso.'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('O texto precisa de pelo menos 20 caracteres.'),
        ).toBeInTheDocument();

        const send = screen.getByRole('button', { name: 'Enviar contestação' });
        expect(send).toBeDisabled();
        fireEvent.change(
            screen.getByLabelText('Por que a decisão deveria mudar?'),
            {
                target: { value: 'Os links eram da documentação oficial.' },
            },
        );
        expect(send).toBeEnabled();
        testForm.errors = {};
    });

    it('enviada ou fora do prazo, não tem formulário', () => {
        const { rerender } = render(
            <Appeal {...props} alreadyAppealed open={false} />,
        );
        expect(screen.getByRole('status')).toBeInTheDocument();

        rerender(<Appeal {...props} open={false} />);
        expect(
            screen.queryByRole('button', { name: 'Enviar contestação' }),
        ).not.toBeInTheDocument();
        expect(screen.getByText(/O prazo para contestar/)).toBeInTheDocument();
    });
});
