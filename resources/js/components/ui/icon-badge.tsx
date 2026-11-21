import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ícone grande no topo das telas em cartão onde o mascote não entra
 * (segurança e administração, DESIGN §5.3). É decorativo.
 */
export default function IconBadge({
    Icon,
    className,
}: {
    Icon: LucideIcon;
    className?: string;
}) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex size-16 items-center justify-center rounded-[20px] bg-surface-muted text-primary-text ring-1 ring-pastel-lavender ring-inset dark:ring-border',
                className,
            )}
        >
            <Icon className="size-8" />
        </span>
    );
}
