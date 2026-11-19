import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/test/inertia';

// O hook de tema guarda a escolha em memória; cada teste carrega uma cópia nova.
async function loadComponents() {
    vi.resetModules();

    return import('@/components/site/theme-toggle');
}

const isDark = (): boolean =>
    document.documentElement.classList.contains('dark');

describe('seleção de tema no site', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = '';
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('o botão alterna entre dispositivo, claro e escuro', async () => {
        const { ThemeToggle } = await loadComponents();
        render(<ThemeToggle />);

        fireEvent.click(
            screen.getByRole('button', { name: /seguir o dispositivo/i }),
        );
        expect(localStorage.getItem('appearance')).toBe('light');

        fireEvent.click(screen.getByRole('button', { name: /tema: claro/i }));
        expect(isDark()).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: /tema: escuro/i }));
        expect(localStorage.getItem('appearance')).toBe('system');
        expect(isDark()).toBe(false);
    });

    it('a lista do rodapé aplica a opção escolhida', async () => {
        const { ThemeSelect } = await loadComponents();
        render(<ThemeSelect />);

        fireEvent.change(screen.getByLabelText('Tema'), {
            target: { value: 'dark' },
        });

        expect(isDark()).toBe(true);
        expect(screen.getByLabelText('Tema')).toHaveValue('dark');
    });
});
