import { vi } from 'vitest';
import type { Locale } from '@/lib/i18n';

/** Props compartilhadas pelo servidor, para testar componentes fora do Inertia. */
export const testPage = { props: { locale: 'pt_BR' as Locale } };

vi.mock('@inertiajs/react', async (original) => ({
    ...(await original<typeof import('@inertiajs/react')>()),
    usePage: () => testPage,
}));
