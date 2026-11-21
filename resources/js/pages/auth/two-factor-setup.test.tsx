import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import TwoFactorSetup from '@/pages/auth/two-factor-setup';

const base = { qrCodeSvg: null, secretKey: null, recoveryCodes: [] };

describe('ativação do 2FA', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    it('começa explicando e pedindo para ativar', () => {
        render(<TwoFactorSetup {...base} step="start" />);

        expect(screen.getByText('Passo 1 de 3')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Ativar agora' }),
        ).toBeInTheDocument();
    });

    it('mostra o QR code com nome, a chave manual e o campo do código', () => {
        render(
            <TwoFactorSetup
                {...base}
                step="scan"
                qrCodeSvg="<svg></svg>"
                secretKey="ABCDEF123456"
            />,
        );

        expect(screen.getByText('Passo 2 de 3')).toBeInTheDocument();
        expect(
            screen.getByRole('img', {
                name: 'QR code para adicionar a conta he4rt ink no app autenticador',
            }),
        ).toBeInTheDocument();
        expect(screen.getByText('ABCDEF123456')).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: 'Código que aparece no app' }),
        ).toHaveAttribute('autocomplete', 'one-time-code');
    });

    it('só deixa ir para o painel depois de marcar que guardou os códigos', () => {
        render(
            <TwoFactorSetup
                {...base}
                step="recovery"
                recoveryCodes={['aaaa-bbbb', 'cccc-dddd']}
            />,
        );

        expect(
            screen.getByRole('list', { name: 'Códigos de recuperação' }),
        ).toHaveTextContent('aaaa-bbbbcccc-dddd');
        expect(
            screen.getByRole('button', { name: 'Ir para o painel' }),
        ).toBeDisabled();

        fireEvent.click(
            screen.getByRole('checkbox', {
                name: 'Guardei os códigos num lugar seguro',
            }),
        );

        expect(
            screen.getByRole('link', { name: 'Ir para o painel' }),
        ).toHaveAttribute('href', '/admin');
    });
});
