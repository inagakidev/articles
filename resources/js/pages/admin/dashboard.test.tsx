import { render, screen } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import AdminLayout from '@/layouts/admin-layout';
import Dashboard from '@/pages/admin/dashboard';

const props = {
    metrics: { users: 412, published: 68, pending: 5, reports: 3 },
    attention: [],
    lateHours: 6,
    updatedAt: '2026-11-21T09:40:00Z',
};

describe('painel da administração', () => {
    beforeEach(() => {
        Object.assign(testPage, { url: '/admin' });
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            name: 'he4rt ink',
            auth: {
                user: { name: 'Amanda Inagaki', email: 'amanda@exemplo.dev' },
            },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('cumprimenta pela hora e mostra quando os números foram lidos', () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date(2026, 10, 21, 9, 40));
        render(<Dashboard {...props} />);

        expect(
            screen.getByRole('heading', { level: 1, name: 'Bom dia, Amanda' }),
        ).toBeInTheDocument();
        expect(screen.getByText(/^Atualizado às/)).toBeInTheDocument();
    });

    it.each([
        [14, 'Boa tarde, Amanda'],
        [20, 'Boa noite, Amanda'],
    ])('às %ih diz "%s"', (hour, greeting) => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date(2026, 10, 21, hour, 0));
        render(<Dashboard {...props} />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            greeting,
        );
    });

    it('lê o total de usuários já formatado, sem o contador animado', () => {
        render(<Dashboard {...props} />);
        const metrics = screen.getByRole('region', {
            name: 'Números da plataforma',
        });

        expect(metrics).toHaveTextContent('Usuários cadastrados');
        expect(metrics).toHaveTextContent('412');
        expect(metrics.querySelector('.count-up')).toHaveAttribute(
            'aria-hidden',
            'true',
        );
    });

    it('sem avisos, diz que está tudo em dia', () => {
        render(<Dashboard {...props} />);

        expect(
            screen.getByRole('region', { name: 'Precisa da sua atenção' }),
        ).toHaveTextContent('Tudo em dia');
    });

    it('o layout marca a seção atual e nomeia o menu da conta', () => {
        render(
            <AdminLayout>
                <Dashboard {...props} />
            </AdminLayout>,
        );
        const nav = screen.getByRole('navigation', { name: 'Administração' });

        expect(nav.querySelector('[aria-current="page"]')).toHaveTextContent(
            'Painel',
        );
        expect(
            screen.getByRole('button', {
                name: 'Menu da conta: Amanda Inagaki',
            }),
        ).toBeInTheDocument();
        // 2FA desligado (D84): sem o selo
        expect(screen.queryByText('2FA ativo')).toBeNull();
    });

    it('com o 2FA ligado, o cabeçalho mostra o selo', () => {
        Object.assign(testPage.props, {
            auth: {
                user: { name: 'Amanda Inagaki', email: 'amanda@exemplo.dev' },
                adminTwoFactor: true,
            },
        });
        render(
            <AdminLayout>
                <Dashboard {...props} />
            </AdminLayout>,
        );

        expect(screen.getByText('2FA ativo')).toBeInTheDocument();
    });

    it('mostra a fila e avisa das versões atrasadas', () => {
        render(
            <Dashboard
                {...props}
                attention={[
                    {
                        type: 'late_version',
                        id: 7,
                        title: 'Filas no Laravel',
                        author: 'lia-martins',
                        hours: 8,
                    },
                ]}
            />,
        );

        expect(screen.getByText('Aguardando aprovação')).toBeInTheDocument();
        expect(
            screen.getByText('Versão passou do prazo de 6 h'),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                '“Filas no Laravel”, de @lia-martins · há 8 h na fila',
            ),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Revisar' })).toHaveAttribute(
            'href',
            '/admin/versions/7',
        );
    });
});
