import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import '@/test/inertia';
import Suspended from '@/pages/account/suspended';

const penalty = {
    type: 'suspension' as const,
    reason: 'Três artigos com links de afiliado sem aviso.',
    policyItem: '1.2',
    endsAt: '2026-11-21T18:02:00Z',
    appealDeadline: '2026-11-21T10:00:00Z',
    appealUrl: '/contestar/3?signature=abc',
    appealed: false,
    notifiedAt: '2026-11-14T10:00:00Z',
};

describe('conta penalizada', () => {
    it('suspensa: até quando, o motivo e o caminho para contestar', () => {
        render(<Suspended penalty={penalty} />);

        expect(
            screen.getByRole('heading', {
                name: /Sua conta está suspensa até/,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText(/item 1\.2/)).toHaveTextContent(
            'Nada foi apagado',
        );
        expect(
            screen.getByText('Três artigos com links de afiliado sem aviso.'),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Contestar' })).toHaveAttribute(
            'href',
            '/contestar/3?signature=abc',
        );
        expect(screen.getByText('Sair')).toBeInTheDocument();
    });

    it('banida: avisa que o conteúdo foi apagado e que a conta é excluída sem contestação aceita', () => {
        render(
            <Suspended
                penalty={{
                    ...penalty,
                    type: 'ban',
                    endsAt: null,
                    appealUrl: null,
                    appealed: true,
                }}
            />,
        );

        expect(
            screen.getByRole('heading', { name: 'Conta banida' }),
        ).toBeInTheDocument();
        expect(screen.getByText(/foram apagados/)).toHaveTextContent(
            'ela é excluída',
        );
        expect(
            screen.getByText(/Sua contestação foi enviada/),
        ).toBeInTheDocument();
    });
});
