import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Estado vazio de uma lista ou seção ("Fila em dia", "Tudo em dia"): ícone,
 * o que aconteceu e, quando houver, o próximo passo.
 */
export default function EmptyState({
    Icon,
    title,
    text,
    action,
    className,
}: {
    Icon: LucideIcon;
    title: string;
    text: string;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-2 px-4 py-8 text-center',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="mb-1 inline-flex size-12 items-center justify-center rounded-[14px] bg-pastel-mint text-pastel-mint-fg"
            >
                <Icon className="size-6" />
            </span>
            <p className="font-display text-[1.0625rem] font-extrabold">
                {title}
            </p>
            <p className="max-w-100 text-meta text-text-secondary">{text}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
