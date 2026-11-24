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
import LandingHeader from '@/layouts/parts/landing-header';

describe('cabeçalho da apresentação', () => {
    beforeEach(() => {
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('leva às seções, troca tema e idioma, pausa as animações e chama para escrever', () => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: null },
        });
        render(<LandingHeader />);
        const sections = screen.getByRole('navigation', { name: 'Seções' });

        expect(
            [...sections.querySelectorAll('a')].map((link) =>
                link.getAttribute('href'),
            ),
        ).toEqual(['#como', '#recursos', '#para-quem', '#faq']);
        expect(
            screen.getByRole('button', { name: 'Pausar animações' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
            'href',
            '/login',
        );
        expect(
            screen.getByRole('link', { name: /Começar a escrever/ }),
        ).toHaveAttribute('href', '/register');
        expect(
            screen.getByRole('button', { name: /Tema/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /English/ }),
        ).toBeInTheDocument();
    });

    it('para quem já entrou, chama para escrever e mostra o menu da conta', () => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: { name: 'Lia Martins', email: 'lia@exemplo.dev' } },
        });
        render(<LandingHeader />);

        expect(screen.getByRole('link', { name: 'Escrever' })).toHaveAttribute(
            'href',
            '/write',
        );
        expect(
            screen.getByRole('button', { name: 'Menu da conta: Lia Martins' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull();
    });
});
