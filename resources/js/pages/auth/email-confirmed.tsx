import { Head, Link, usePage } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import { useTranslation } from '@/lib/i18n';
import { home } from '@/routes';

/** Destino e cor de cada pedaço de confete, como na prancha. */
const pieces: [x: number, y: number, color: string][] = [
    [-110, -90, 'bg-primary'],
    [-70, -130, 'bg-pastel-pink'],
    [-25, -145, 'bg-pastel-yellow'],
    [25, -140, 'bg-pastel-mint'],
    [75, -125, 'bg-pastel-blue'],
    [115, -85, 'bg-pastel-peach'],
    [-130, -30, 'bg-primary'],
    [130, -35, 'bg-pastel-pink'],
    [-55, -80, 'bg-pastel-yellow'],
    [55, -85, 'bg-pastel-mint'],
    [0, -105, 'bg-pastel-blue'],
    [-90, -55, 'bg-pastel-peach'],
    [90, -50, 'bg-primary'],
    [-15, -60, 'bg-pastel-pink'],
];

/**
 * Depois de confirmar o e-mail. Os passos 1-2-3 e o "Começar meu primeiro
 * artigo" da prancha entram com o editor (fatia 8); até lá, o destino é a
 * página inicial (D72).
 */
export default function EmailConfirmed() {
    const { t } = useTranslation();
    const { auth } = usePage().props as { auth: { user: { name: string } } };
    const firstName = auth.user.name.split(' ')[0];

    return (
        <>
            <Head title={t('account.verified.title')} />

            <div className="relative inline-flex">
                {pieces.map(([x, y, color], index) => (
                    <i
                        key={index}
                        aria-hidden="true"
                        className={`confetti-piece ${color}`}
                        style={
                            {
                                '--confetti-x': `${x}px`,
                                '--confetti-y': `${y}px`,
                            } as CSSProperties
                        }
                    />
                ))}
                <Mascot
                    art="comemorando"
                    size={200}
                    className="animate-float"
                />
            </div>

            <AuthCardHeader
                title={t('account.verified.title')}
                description={t('account.verified.body', { name: firstName })}
            />

            <Button asChild size="xl" className="w-full">
                <Link href={home()}>{t('account.verified.home')}</Link>
            </Button>
        </>
    );
}

EmailConfirmed.layout = { variant: 'card' } satisfies AuthLayoutProps;
