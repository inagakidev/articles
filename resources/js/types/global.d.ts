import type { Locale } from '@/lib/i18n';
import type { SharedNotifications } from '@/components/notifications/types';
import type { Auth } from '@/types/auth';
import type { FlashToast } from '@/types/ui';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            locale: Locale;
            auth: Auth;
            /** O sino: só para quem está logada (D90). */
            notifications?: SharedNotifications | null;
            [key: string]: unknown;
        };
        flashDataType: {
            toast?: FlashToast;
            /** Enviado para revisão: o aviso no topo de Meus artigos (RF-377). */
            submitted?: { articleId: number; title: string | null };
        };
    }
}
