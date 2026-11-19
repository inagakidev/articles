import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { testPage } from '@/test/inertia';
import SiteHeader from '@/components/site/site-header';

vi.mock('@/hooks/use-appearance', () => ({
    useAppearance: () => ({ appearance: 'system', updateAppearance: vi.fn() }),
}));

function renderIn(locale: 'pt_BR' | 'en', user: object | null = null) {
    Object.assign(testPage.props, {
        locale,
        name: 'Plataforma de Artigos',
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
        expect(
            screen.getByRole('link', { name: 'Criar conta' }),
        ).toBeInTheDocument();
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

    it('mostra Meus artigos para quem está logado', () => {
        renderIn('pt_BR', { id: 1 });
        expect(
            screen.getByRole('link', { name: 'Meus artigos' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Entrar' })).toBeNull();
    });
});
