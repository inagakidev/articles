import { useSyncExternalStore } from 'react';

/**
 * Pausa das animações contínuas (RF-383, WCAG 2.2.2). A escolha fica no
 * navegador da pessoa e vale para o site inteiro. O script do app.blade.php
 * aplica a classe antes da página aparecer, para nada se mexer à toa.
 */
export const MOTION_STORAGE_KEY = 'motion';
export const MOTION_PAUSED_CLASS = 'motion-paused';

const listeners = new Set<() => void>();

const isPaused = (): boolean =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains(MOTION_PAUSED_CLASS);

function setPaused(paused: boolean): void {
    document.documentElement.classList.toggle(MOTION_PAUSED_CLASS, paused);

    try {
        if (paused) {
            localStorage.setItem(MOTION_STORAGE_KEY, 'paused');
        } else {
            localStorage.removeItem(MOTION_STORAGE_KEY);
        }
    } catch {
        // Sem armazenamento (janela anônima, bloqueio): vale só nesta página.
    }

    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => listeners.delete(listener);
}

export function useMotionPause() {
    const paused = useSyncExternalStore(subscribe, isPaused, () => false);

    return { paused, toggle: () => setPaused(!paused) } as const;
}
