import { vi } from 'vitest';
import type { Idioma } from '@/lib/i18n';

/** Props compartilhadas pelo servidor, para testar componentes fora do Inertia. */
export const paginaDeTeste = { props: { locale: 'pt_BR' as Idioma } };

vi.mock('@inertiajs/react', async (original) => ({
    ...(await original<typeof import('@inertiajs/react')>()),
    usePage: () => paginaDeTeste,
}));
