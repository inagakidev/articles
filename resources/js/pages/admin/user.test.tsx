import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import '@/test/inertia';
import AdminUser from '@/pages/admin/user';

const props = {
    user: {
        id: 4,
        name: 'Caio Lima',
        username: 'caio-lima',
        email: 'caio@exemplo.dev',
        avatar: null,
        since: '2026-06-01',
        verified: true,
        admin: false,
        suspendedUntil: null,
        banned: false,
    },
    stats: {
        published: 4,
        comments: 37,
        pending: 1,
        openReports: 1,
        penalties: 1,
    },
    penalties: [
        {
            id: 1,
            type: 'suspension' as const,
            days: 7,
            policyItem: '1.2',
            appliedBy: 'Amanda',
            startsAt: '2026-09-02T10:00:00Z',
            status: 'ended' as const,
            reopenable: false,
        },
    ],
    canPenalize: true,
    durations: [7, 15, 30],
    appealDays: 7,
    policyItems: [{ id: '2.1', title: 'Ofensa e assédio' }],
};

describe('usuário no painel', () => {
    it('mostra os números e o histórico', () => {
        render(<AdminUser {...props} />);

        expect(
            screen.getByRole('heading', { level: 1, name: 'Caio Lima' }),
        ).toBeInTheDocument();
        expect(screen.getByText('37')).toBeInTheDocument();
        expect(
            screen.getByRole('cell', { name: 'Suspensão · 7 dias' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('cell', { name: 'Encerrada' }),
        ).toBeInTheDocument();
    });

    it('aplicar penalidade mostra o que a suspensão esconde antes de confirmar', () => {
        render(<AdminUser {...props} />);

        fireEvent.click(
            screen.getByRole('button', { name: 'Aplicar penalidade' }),
        );

        const dialog = screen.getByRole('dialog', {
            name: 'Aplicar penalidade a @caio-lima',
        });
        expect(dialog).toHaveTextContent('Durante 15 dias');
        expect(dialog).toHaveTextContent('4 artigos e 37 comentários ocultos');
        expect(
            screen.getByRole('button', { name: 'Suspender por 15 dias' }),
        ).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Duração'), {
            target: { value: '30' },
        });
        expect(
            screen.getByRole('button', { name: 'Suspender por 30 dias' }),
        ).toBeInTheDocument();
    });

    it('banir pede a confirmação de que o conteúdo é apagado', () => {
        render(<AdminUser {...props} />);

        fireEvent.click(
            screen.getByRole('button', { name: 'Aplicar penalidade' }),
        );
        fireEvent.click(
            screen.getByRole('radio', { name: 'Banimento definitivo' }),
        );

        const submit = screen.getByRole('button', {
            name: 'Banir e apagar o conteúdo',
        });
        expect(submit).toBeDisabled();
        expect(screen.queryByLabelText('Duração')).not.toBeInTheDocument();
        fireEvent.click(
            screen.getByRole('checkbox', {
                name: /Entendo que o conteúdo é apagado/,
            }),
        );
        expect(submit).toBeEnabled();
    });

    it('banimento retido com o prazo vencido pode ter o prazo reaberto', () => {
        render(
            <AdminUser
                {...props}
                canPenalize={false}
                user={{ ...props.user, banned: true }}
                penalties={[
                    {
                        ...props.penalties[0],
                        type: 'ban',
                        days: null,
                        status: 'active',
                        reopenable: true,
                    },
                ]}
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Reabrir prazo (7 dias)' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Reativar' }),
        ).toBeInTheDocument();
    });

    it('quem não pode ser penalizado não tem o botão', () => {
        render(<AdminUser {...props} canPenalize={false} />);

        expect(
            screen.queryByRole('button', { name: 'Aplicar penalidade' }),
        ).not.toBeInTheDocument();
    });
});
