import { Link, usePage } from '@inertiajs/react';
import Mascote from '@/components/mascote';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export default function SiteLogo({
    tamanho = 32,
    className,
}: {
    tamanho?: number;
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
            <span className="font-display text-lg font-extrabold tracking-tight">
                {name}
            </span>
        </Link>
    );
}
