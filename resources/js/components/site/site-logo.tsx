import { Link, usePage } from '@inertiajs/react';
import Mascot from '@/components/mascot';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export default function SiteLogo({
    size = 32,
    nameOnlyOnDesktop = false,
    className,
}: {
    size?: number;
    /** No celular, mostra só o avatar; o nome continua para leitores de tela. */
    nameOnlyOnDesktop?: boolean;
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
            <Mascot art="rosto" size={size} />
            <span
                className={cn(
                    'font-display text-lg font-extrabold tracking-tight',
                    nameOnlyOnDesktop && 'sr-only sm:not-sr-only',
                )}
            >
                {name}
            </span>
        </Link>
    );
}
