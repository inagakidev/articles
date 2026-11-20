import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import LandingHeader from '@/components/site/landing-header';

describe('cabeçalho da apresentação', () => {
    it('leva às seções, pausa as animações e chama para escrever', () => {
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
            screen.getByRole('link', { name: 'Começar a escrever' }),
        ).toHaveAttribute('href', '/register');
    });

    it('para quem já entrou, leva aos próprios artigos', () => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: { name: 'Lia' } },
        });
        render(<LandingHeader />);

        expect(
            screen.getByRole('link', { name: 'Meus artigos' }),
        ).toHaveAttribute('href', '/dashboard');
        expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull();
    });
});
