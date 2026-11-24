import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vite-plus/test';
import '@/test/inertia';
import RequiredUsername from '@/pages/auth/required-username';

vi.mock('@/hooks/use-username-availability', () => ({
    useUsernameAvailability: () => ({ status: 'idle' }),
}));

describe('trocar username obrigatório', () => {
    it('diz o motivo e confere as regras enquanto a pessoa digita', () => {
        render(<RequiredUsername username="compre-cursos" policyItem="1.2" />);

        expect(
            screen.getByText(/@compre-cursos foi considerado inadequado/),
        ).toHaveTextContent('item 1.2');

        fireEvent.change(screen.getByLabelText('Novo username'), {
            target: { value: 'Pedro' },
        });

        expect(screen.getByLabelText('Novo username')).toHaveValue('pedro');
        expect(
            screen.getByText('Começa com letra').closest('li'),
        ).toHaveTextContent('(ok)');
        expect(
            screen.getByRole('button', { name: 'Salvar e continuar' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/O antigo deixa de funcionar/),
        ).toBeInTheDocument();
    });
});
