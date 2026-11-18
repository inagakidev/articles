import { Link, usePage } from '@inertiajs/react';
import Mascote from '@/components/mascote';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export default function SiteLogo({
    tamanho = 32,
    nomeSoNoDesktop = false,
    className,
}: {
    tamanho?: number;
    /** No celular, mostra só o avatar; o nome continua para leitores de tela. */
    nomeSoNoDesktop?: boolean;
    className?: string;
}) {
    const { name } = usePage().props;

    return (
        <Link
            href={home()}
            className={cn(
                'flex items-center gap-2.5 rounded-md text-text-primary',
                className,
            )}
        >
            <Mascote arte="mascote-avatar" tamanho={tamanho} />
            <span
                className={cn(
                    'font-display text-lg font-extrabold tracking-tight',
                    nomeSoNoDesktop && 'sr-only sm:not-sr-only',
                )}
            >
                {name}
            </span>
        </Link>
    );
}
