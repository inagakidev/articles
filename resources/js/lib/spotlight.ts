import type { PointerEvent } from 'react';

/**
 * Leva a posição do mouse para o brilho `.spotlight` (app.css). Só o mouse:
 * no toque, o brilho não aparece.
 */
export function followPointer(event: PointerEvent<HTMLElement>): void {
    if (event.pointerType !== 'mouse') {
        return;
    }

    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
        '--spot-x',
        `${event.clientX - box.left}px`,
    );
    event.currentTarget.style.setProperty(
        '--spot-y',
        `${event.clientY - box.top}px`,
    );
}
