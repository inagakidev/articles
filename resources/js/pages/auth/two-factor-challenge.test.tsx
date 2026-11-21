import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testForm, testPage } from '@/test/inertia';
import TwoFactorChallenge from '@/pages/auth/two-factor-challenge';

describe('código do 2FA no login', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
        testForm.errors = {};
    });

    it('pede o código do app e troca para um código de recuperação', () => {
        render(<TwoFactorChallenge />);

        expect(
            screen.getByRole('textbox', { name: 'Código de 6 dígitos' }),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Usar um código de recuperação',
            }),
        );

        expect(
            screen.getByRole('textbox', { name: 'Código de recuperação' }),
        ).toHaveAttribute('name', 'recovery_code');
        expect(
            screen.getByRole('button', { name: 'Usar o código do app' }),
        ).toBeInTheDocument();
    });

    it('mostra o erro ligado ao campo', () => {
        testForm.errors = { code: 'Esse código não confere.' };
        render(<TwoFactorChallenge />);

        expect(
            screen.getByRole('textbox', { name: 'Código de 6 dígitos' }),
        ).toHaveAccessibleDescription('Esse código não confere.');
    });
});
