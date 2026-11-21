import { fireEvent, render, screen } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testForm, testPage } from '@/test/inertia';
import Appearance from '@/pages/settings/appearance';
import Profile from '@/pages/settings/profile';
import Security from '@/pages/settings/security';

vi.mock('@/hooks/use-appearance', () => ({
    useAppearance: () => ({ appearance: 'dark', updateAppearance: vi.fn() }),
}));

describe('configurações', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
        testForm.errors = {};
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('perfil público: foto, nome, username com aviso e bio com contador', () => {
        render(
            <Profile
                profile={{
                    name: 'Lia Martins',
                    username: 'lia-martins',
                    bio: 'Front-end.',
                    avatar: null,
                }}
                bioMax={300}
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Adicionar foto' }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Nome')).toHaveValue('Lia Martins');
        expect(screen.getByLabelText('Username')).toHaveAccessibleDescription(
            /o endereço antigo do perfil deixa de funcionar/,
        );

        fireEvent.change(screen.getByLabelText('Bio'), {
            target: { value: 'Front-end e a11y.' },
        });

        expect(screen.getByLabelText('Bio')).toHaveAccessibleDescription(
            'Aparece no seu perfil público. 17 de 300 caracteres.',
        );
        expect(
            screen.getByRole('link', { name: 'Ver meu perfil' }),
        ).toHaveAttribute('href', '/@lia-martins');
    });

    it('com foto, oferece trocar e remover', () => {
        render(
            <Profile
                profile={{
                    name: 'Lia',
                    username: 'lia',
                    bio: null,
                    avatar: '/media/avatars/x.webp',
                }}
                bioMax={300}
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Trocar foto' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Remover' }),
        ).toBeInTheDocument();
    });

    it('segurança: mostra a troca pendente e abre o formulário de senha', () => {
        render(
            <Security
                email="lia@exemplo.dev"
                pendingEmail={{
                    address: 'nova@exemplo.dev',
                    expiresAt: '2026-11-22T14:32:00Z',
                }}
                passwordChangedAt="2026-03-02T10:00:00Z"
                passwordRules=""
                canManageTwoFactor={false}
            />,
        );

        expect(screen.getByRole('status')).toHaveTextContent(
            'Troca de e-mail pendente',
        );
        expect(screen.getByRole('status')).toHaveTextContent(
            'nova@exemplo.dev',
        );
        expect(
            screen.getByRole('link', { name: 'Cancelar troca' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Alterada pela última vez em 2 de mar\. de 2026/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('heading', {
                name: 'Verificação em duas etapas',
            }),
        ).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

        expect(screen.getByLabelText('Senha atual')).toBeInTheDocument();
        expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
    });

    it('aparência: tema e idioma como grupos de opções', () => {
        render(<Appearance />);

        expect(screen.getByRole('radio', { name: 'Escuro' })).toBeChecked();
        expect(
            screen.getByRole('radiogroup', { name: 'Idioma da interface' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Português' })).toBeChecked();
    });
});
