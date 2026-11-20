import { act, render, screen } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testForm, testPage } from '@/test/inertia';
import Login from '@/pages/auth/login';

function renderLogin(
    props: Partial<Parameters<typeof Login>[0]> = {},
    locale: 'pt_BR' | 'en' = 'pt_BR',
) {
    Object.assign(testPage.props, { locale });

    return render(<Login canResetPassword {...props} />);
}

describe('tela de entrar', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => {
        vi.useRealTimers();
        testForm.errors = {};
    });

    it('liga o erro do servidor ao campo, para o leitor de tela', () => {
        testForm.errors = { email: 'Credenciais inválidas.' };
        renderLogin();

        const email = screen.getByLabelText('E-mail');
        expect(email).toHaveAttribute('aria-invalid', 'true');
        expect(email).toHaveAccessibleDescription('Credenciais inválidas.');
    });

    it('tem os campos com rótulo e o botão de entrar', () => {
        renderLogin();

        expect(screen.getByLabelText('E-mail')).toHaveAttribute(
            'type',
            'email',
        );
        expect(screen.getByLabelText('Senha')).toHaveAttribute(
            'type',
            'password',
        );
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
        expect(
            screen.getByRole('link', { name: 'Esqueci a senha' }),
        ).toBeInTheDocument();
    });

    it('não pede para lembrar a sessão: ela dura 14 dias sem uso', () => {
        const { container } = renderLogin();

        expect(container.querySelector('[name=remember]')).toBeNull();
    });

    it('mostra os textos em inglês', () => {
        renderLogin({}, 'en');

        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Log in' }),
        ).toBeInTheDocument();
    });

    it('com o login pausado, avisa e desabilita o botão até o prazo acabar', () => {
        renderLogin({ retryAfter: 2 });

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Muitas tentativas seguidas',
        );
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled();

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.queryByRole('alert')).toBeNull();
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
    });

    it('o leitor de tela ouve o prazo inicial, não a contagem', () => {
        renderLogin({ retryAfter: 30 });

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        const alert = screen.getByRole('alert');
        expect(alert.querySelector('.sr-only')).toHaveTextContent(
            '30 segundos',
        );
        expect(
            alert.querySelector('[aria-hidden=true]:not(svg)'),
        ).toHaveTextContent('25 segundos');
    });
});
