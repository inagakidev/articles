/**
 * Transições entre dois estados da página inteira pela View Transitions API
 * (D74). Sem suporte no navegador ou com "reduzir movimento", a troca é
 * instantânea, como antes.
 */

/** Classe no <html> enquanto a transição roda; css/app/transitions.css escolhe o efeito por ela. */
export type TransitionKind = 'vt-theme' | 'vt-locale';

export function canAnimateTransition(): boolean {
    return (
        typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

/** Marca o <html> com o tipo da transição até ela terminar. */
export function markTransition(
    kind: TransitionKind,
    transition: { finished: Promise<unknown> },
): void {
    const root = document.documentElement;
    root.classList.add(kind);
    void transition.finished.finally(() => root.classList.remove(kind));
}

/**
 * Troca do tema num círculo que cresce a partir do elemento clicado até
 * cobrir a tela.
 */
export function revealFrom(origin: Element, update: () => void): void {
    if (!canAnimateTransition()) {
        update();

        return;
    }

    const box = origin.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
    );
    const root = document.documentElement;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-radius', `${radius}px`);

    markTransition('vt-theme', document.startViewTransition(update));
}
