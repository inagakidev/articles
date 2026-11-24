import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import AccountMenu from '@/layouts/parts/account-menu';

function open(user: object | null) {
    Object.assign(testPage.props, { locale: 'pt_BR', auth: { user } });
    render(<AccountMenu />);
    const trigger = screen.queryByRole('button', { name: /^Menu da conta/ });

    if (trigger) {
        // O Radix abre o menu com o ponteiro, não com o clique simulado.
        fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    }

    return trigger;
}

describe('menu da conta', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    it('não aparece para visitante', () => {
        expect(open(null)).toBeNull();
    });

    it('tem Meus artigos, Configurações e Sair, sem o painel para quem não administra', () => {
        open({
            name: 'Lia Martins',
            email: 'lia@exemplo.dev',
            is_admin: false,
        });

        expect(
            screen.getByRole('menuitem', { name: 'Meus artigos' }),
        ).toHaveAttribute('href', '/my-articles');
        expect(
            screen.getByRole('menuitem', { name: 'Configurações' }),
        ).toHaveAttribute('href', '/settings/profile');
        expect(
            screen.getByRole('menuitem', { name: 'Sair' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: 'Painel da administração' }),
        ).toBeNull();
    });

    it('leva a administradora ao painel', () => {
        open({
            name: 'Amanda Inagaki',
            email: 'amanda@exemplo.dev',
            is_admin: true,
        });

        expect(
            screen.getByRole('menuitem', { name: 'Painel da administração' }),
        ).toHaveAttribute('href', '/admin');
    });
});
