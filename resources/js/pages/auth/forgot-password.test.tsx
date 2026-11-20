import { act, render, screen } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import ForgotPassword from '@/pages/auth/forgot-password';

function renderPage(
    props: Parameters<typeof ForgotPassword>[0] = {},
    locale: 'pt_BR' | 'en' = 'pt_BR',
) {
    Object.assign(testPage.props, { locale });

    return render(<ForgotPassword {...props} />);
}

describe('recuperar senha', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('pede o e-mail para enviar o link', () => {
        renderPage();

        expect(
            screen.getByRole('heading', { name: 'Esqueceu a senha?' }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('E-mail')).toHaveAttribute(
            'type',
            'email',
        );
        expect(
            screen.getByRole('button', { name: 'Enviar link' }),
        ).toBeEnabled();
    });

    it('depois do pedido, mostra o link enviado sem dizer se a conta existe', () => {
        renderPage({ sentTo: 'lia@exemplo.dev', resendAfter: 60 });

        expect(
            screen.getByRole('heading', { name: 'Link enviado' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent(
            'Se existir uma conta com lia@exemplo.dev, você vai receber um link para criar uma nova senha. O link vale por 60 minutos.',
        );
        expect(
            screen.getByRole('link', { name: 'Voltar para o login' }),
        ).toBeInTheDocument();
    });

    it('libera o reenvio só depois da espera', () => {
        renderPage({ sentTo: 'lia@exemplo.dev', resendAfter: 3 });

        expect(
            screen.getByRole('button', { name: 'Reenviar em 3 s' }),
        ).toBeDisabled();

        act(() => {
            vi.advanceTimersByTime(3000);
        });

        expect(
            screen.getByRole('button', { name: 'Reenviar link' }),
        ).toBeEnabled();
    });

    it('mostra os textos em inglês', () => {
        renderPage({ sentTo: 'lia@exemplo.dev', resendAfter: 0 }, 'en');

        expect(
            screen.getByRole('heading', { name: 'Link sent' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Resend link' }),
        ).toBeInTheDocument();
    });
});
