import { usePage } from '@inertiajs/react';
import { register } from '@/routes';
import { create } from '@/routes/articles';

/**
 * Para onde leva "Escrever": o editor para quem já entrou; o cadastro para
 * visitante. Conta sem confirmar cai na confirmação de e-mail (RF-014).
 */
export function useWriteHref() {
    const { auth } = usePage().props;

    return auth.user ? create() : register();
}
