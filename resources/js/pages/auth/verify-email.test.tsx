import { act, fireEvent, render, screen } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import VerifyEmail from '@/pages/auth/verify-email';

describe('confira seu e-mail', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });
    afterEach(() => vi.useRealTimers());

    it('mostra para onde o link foi e o que já dá para fazer', () => {
        render(<VerifyEmail email="lia@exemplo.dev" />);

        expect(
            screen.getByRole('heading', { name: 'Confira seu e-mail' }),
        ).toBeInTheDocument();
        expect(screen.getByText('lia@exemplo.dev')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent(
            'Contas sem confirmação em 7 dias são excluídas.',
        );
    });

    it('libera o reenvio depois da espera, mostrada em minutos e segundos', () => {
        render(<VerifyEmail email="lia@exemplo.dev" resendAfter={45} />);

        expect(
            screen.getByRole('button', { name: 'Reenviar em 0:45' }),
        ).toBeDisabled();

        act(() => {
            vi.advanceTimersByTime(45_000);
        });

        expect(
            screen.getByRole('button', { name: 'Reenviar e-mail' }),
        ).toBeEnabled();
    });

    it('"Usar outro e-mail" abre o campo do novo e-mail', () => {
        render(<VerifyEmail email="lia@exemplo.dev" />);

        fireEvent.click(
            screen.getByRole('button', { name: 'Usar outro e-mail' }),
        );

        expect(screen.getByLabelText('Novo e-mail')).toHaveAttribute(
            'type',
            'email',
        );

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(screen.queryByLabelText('Novo e-mail')).toBeNull();
    });
});
