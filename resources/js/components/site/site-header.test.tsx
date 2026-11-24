import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import SiteHeader from '@/components/site/site-header';

vi.mock('@/hooks/use-appearance', () => ({
    useAppearance: () => ({ appearance: 'system', updateAppearance: vi.fn() }),
}));

function renderIn(
    locale: 'pt_BR' | 'en',
    user: object | null = null,
    url = '/',
) {
    testPage.url = url;
    Object.assign(testPage.props, {
        locale,
        name: 'he4rt ink',
        auth: { user },
    });

    return render(<SiteHeader />);
}

describe('cabeçalho do site', () => {
    it('mostra as ações de conta no idioma da página', () => {
        renderIn('pt_BR');
        expect(
            screen.getByRole('link', { name: 'Entrar' }),
        ).toBeInTheDocument();
        // Visitante que quer escrever vai para o cadastro (prancha "Home")
        expect(screen.getByRole('link', { name: 'Escrever' })).toHaveAttribute(
            'href',
            '/register',
        );
    });

    it('leva aos artigos e às categorias, marcando a página atual', () => {
        renderIn('pt_BR', null, '/artigos');
        const nav = screen.getAllByRole('navigation', { name: 'Principal' })[0];

        expect(
            within(nav).getByRole('link', { name: 'Artigos' }),
        ).toHaveAttribute('aria-current', 'page');
        expect(
            within(nav).getByRole('link', { name: 'Categorias' }),
        ).toHaveAttribute('href', '/artigos#categorias');
    });

    it('troca os textos quando o idioma é inglês', () => {
        renderIn('en');
        expect(
            screen.getByRole('link', { name: 'Log in' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /Language: English\. Switch to Português/,
            }),
        ).toHaveTextContent('EN');
    });

    it('para quem entrou, mostra Meus artigos e o menu da conta', () => {
        renderIn('pt_BR', {
            id: 1,
            name: 'Lia Martins',
            email: 'lia@exemplo.dev',
        });
        expect(
            screen.getByRole('link', { name: 'Meus artigos' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Menu da conta: Lia Martins' }),
        ).toHaveTextContent('LM');
        expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull();
    });
});
