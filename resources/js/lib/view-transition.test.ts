import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { revealFrom } from '@/lib/view-transition';

const button = () => {
    const element = document.createElement('button');
    element.getBoundingClientRect = () =>
        ({ left: 90, top: 10, width: 20, height: 20 }) as DOMRect;

    return element;
};

describe('troca de tema com transição', () => {
    afterEach(() => {
        Reflect.deleteProperty(document, 'startViewTransition');
        vi.unstubAllGlobals();
        document.documentElement.className = '';
    });

    it('sem suporte no navegador, troca na hora', () => {
        const update = vi.fn();

        revealFrom(button(), update);

        expect(update).toHaveBeenCalledOnce();
    });

    it('com "reduzir movimento", troca na hora', () => {
        const start = vi.fn();
        Object.assign(document, { startViewTransition: start });
        vi.stubGlobal('matchMedia', () => ({ matches: true }));
        const update = vi.fn();

        revealFrom(button(), update);

        expect(update).toHaveBeenCalledOnce();
        expect(start).not.toHaveBeenCalled();
    });

    it('revela o tema novo num círculo a partir do botão e limpa a marca no fim', async () => {
        let finish = () => {};
        const finished = new Promise<void>((resolve) => (finish = resolve));
        Object.assign(document, {
            startViewTransition: (update: () => void) => {
                update();

                return { finished };
            },
        });
        vi.stubGlobal('matchMedia', () => ({ matches: false }));
        const update = vi.fn();

        revealFrom(button(), update);

        const root = document.documentElement;
        expect(update).toHaveBeenCalledOnce();
        expect(root).toHaveClass('vt-theme');
        expect(root.style.getPropertyValue('--vt-x')).toBe('100px');
        expect(root.style.getPropertyValue('--vt-y')).toBe('20px');

        finish();
        await finished;
        await Promise.resolve();

        expect(root).not.toHaveClass('vt-theme');
    });
});
