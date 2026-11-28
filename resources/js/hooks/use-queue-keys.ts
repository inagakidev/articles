import { router } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * J vai para o próximo item da fila e K para o anterior (revisão de versões,
 * denúncias), menos quando a pessoa está escrevendo ou usa um atalho do
 * sistema.
 */
export function useQueueKeys(
    previousUrl: string | null,
    nextUrl: string | null,
): void {
    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            const typing =
                target?.closest(
                    'input, textarea, select, [contenteditable]',
                ) !== null;

            if (typing || event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            const url =
                event.key === 'j'
                    ? nextUrl
                    : event.key === 'k'
                      ? previousUrl
                      : null;

            if (url !== null) {
                router.visit(url);
            }
        }

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [previousUrl, nextUrl]);
}
