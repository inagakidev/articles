import { createElement } from 'react';
import type { ReactNode } from 'react';
import { vi } from 'vite-plus/test';
import type { Locale } from '@/lib/i18n';

/** Props compartilhadas pelo servidor, para testar componentes fora do Inertia. */
export const testPage = { url: '/', props: { locale: 'pt_BR' as Locale } };

/** Estado que o `<Form>` simulado entrega às páginas (erros de validação). */
export const testForm: { errors: Record<string, string> } = { errors: {} };

type Href = string | { url: string };
const toUrl = (href: Href) => (typeof href === 'string' ? href : href.url);

vi.mock('@inertiajs/react', async (original) => ({
    ...(await original<typeof import('@inertiajs/react')>()),
    usePage: () => testPage,
    // Fora de uma aplicação Inertia, Head não faz nada e Link e Form viram
    // os elementos HTML.
    Head: () => null,
    Link: ({ href, children, ...props }: { href: Href; children: ReactNode }) =>
        createElement('a', { href: toUrl(href), ...props }, children),
    Form: ({
        children,
        className,
        action,
        method,
    }: {
        children: (state: {
            processing: boolean;
            errors: Record<string, string>;
            clearErrors: () => void;
        }) => ReactNode;
        className?: string;
        action?: string;
        method?: string;
    }) =>
        createElement(
            'form',
            { className, action, method },
            children({
                processing: false,
                errors: testForm.errors,
                clearErrors: () => {},
            }),
        ),
}));
