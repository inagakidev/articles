import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * O tailwind-merge só conhece os tamanhos de texto padrão do Tailwind. Sem
 * esta lista, `text-body` (tamanho) e `text-text-on-primary` (cor) seriam
 * tratados como a mesma propriedade, e um apagaria o outro.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [
                'display',
                'h1',
                'h2',
                'h3',
                'card-title',
                'article',
                'body',
                'label',
                'meta',
                'caption',
                'badge',
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}
