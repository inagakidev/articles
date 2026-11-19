import { act, renderHook } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';

type Listener = (event: MediaQueryListEvent) => void;

let systemPrefersDark = false;
const listeners = new Set<Listener>();

function mockSystemPreference(): void {
    vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
            matches:
                query === '(prefers-color-scheme: dark)' && systemPrefersDark,
            media: query,
            addEventListener: (_: string, listener: Listener) =>
                listeners.add(listener),
            removeEventListener: (_: string, listener: Listener) =>
                listeners.delete(listener),
        })),
    );
}

function changeSystemPreference(dark: boolean): void {
    systemPrefersDark = dark;
    listeners.forEach((listener) =>
        listener({ matches: dark } as MediaQueryListEvent),
    );
}

// O módulo guarda a escolha atual em memória; cada teste carrega uma cópia nova.
async function loadThemeModule() {
    vi.resetModules();

    return import('@/hooks/use-appearance');
}

const isDark = (): boolean =>
    document.documentElement.classList.contains('dark');

describe('tema da interface', () => {
    beforeEach(() => {
        systemPrefersDark = false;
        listeners.clear();
        localStorage.clear();
        document.documentElement.className = '';
        document.cookie = 'appearance=; max-age=0; path=/';
        mockSystemPreference();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('segue a preferência escura do dispositivo quando nada foi escolhido', async () => {
        systemPrefersDark = true;
        const { initializeTheme } = await loadThemeModule();

        initializeTheme();

        expect(isDark()).toBe(true);
        expect(localStorage.getItem('appearance')).toBe('system');
    });

    it('acompanha a mudança de preferência do dispositivo com a página aberta', async () => {
        const { initializeTheme } = await loadThemeModule();
        initializeTheme();
        expect(isDark()).toBe(false);

        changeSystemPreference(true);

        expect(isDark()).toBe(true);
    });

    it('aplica a escolha manual e a guarda no cookie de preferência', async () => {
        systemPrefersDark = true;
        const { initializeTheme, useAppearance } = await loadThemeModule();
        initializeTheme();
        const { result } = renderHook(() => useAppearance());

        act(() => result.current.updateAppearance('light'));

        expect(isDark()).toBe(false);
        expect(result.current.appearance).toBe('light');
        expect(document.cookie).toContain('appearance=light');
    });

    it('mantém a escolha manual mesmo se o dispositivo mudar de preferência', async () => {
        const { initializeTheme, useAppearance } = await loadThemeModule();
        initializeTheme();
        const { result } = renderHook(() => useAppearance());
        act(() => result.current.updateAppearance('dark'));

        changeSystemPreference(false);

        expect(isDark()).toBe(true);
    });

    it('restaura a escolha salva ao carregar a página', async () => {
        localStorage.setItem('appearance', 'dark');
        const { initializeTheme } = await loadThemeModule();

        initializeTheme();

        expect(isDark()).toBe(true);
    });
});
