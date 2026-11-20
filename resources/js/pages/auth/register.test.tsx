import { act, fireEvent, render, screen } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testForm, testPage } from '@/test/inertia';
import Register from '@/pages/auth/register';

function respond(body: object) {
    vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(body), { status: 200 }),
    );
}

async function typeUsername(value: string) {
    fireEvent.change(screen.getByLabelText('Username'), {
        target: { value },
    });
    await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
    });
}

describe('criar conta', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('fetch', vi.fn());
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        testForm.errors = {};
    });

    it('tem os campos, as declarações obrigatórias e os links das políticas', () => {
        render(<Register passwordRules="" />);

        for (const label of [
            'Nome',
            'Username',
            'E-mail',
            'Senha',
            'Confirmar senha',
        ]) {
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        }

        expect(screen.getByLabelText('Tenho 16 anos ou mais.')).toBeRequired();
        expect(
            screen.getByRole('checkbox', { name: /Li e aceito/ }),
        ).toBeRequired();
        expect(
            screen.getByRole('link', { name: /Termos de uso/ }),
        ).toHaveAttribute('href', '/terms');
        expect(
            screen.getByRole('link', { name: /Política de privacidade/ }),
        ).toHaveAttribute('href', '/privacy');
        expect(screen.getByLabelText('Senha')).toHaveAccessibleDescription(
            'Mínimo de 8 caracteres',
        );
    });

    it('mostra o endereço do perfil quando o username está livre', async () => {
        render(<Register passwordRules="" />);
        respond({ username: 'lia-martins', available: true, message: null });

        await typeUsername('Lia-Martins');

        expect(screen.getByLabelText('Username')).toHaveValue('lia-martins');
        expect(
            screen.getByText('Disponível · seu perfil será /@lia-martins'),
        ).toBeInTheDocument();
        expect(vi.mocked(fetch).mock.calls[0][0]).toContain(
            'username=lia-martins',
        );
    });

    it('explica por que o username não serve', async () => {
        render(<Register passwordRules="" />);
        respond({
            username: 'admin',
            available: false,
            message: 'Este username é reservado. Escolha outro.',
        });

        await typeUsername('admin');

        expect(
            screen.getByText('Este username é reservado. Escolha outro.'),
        ).toBeInTheDocument();
    });

    it('mostra o erro do servidor na declaração', () => {
        testForm.errors = { age_confirmed: 'Declare ter 16 anos ou mais.' };
        render(<Register passwordRules="" />);

        expect(
            screen.getByLabelText('Tenho 16 anos ou mais.'),
        ).toHaveAccessibleDescription('Declare ter 16 anos ou mais.');
    });
});
