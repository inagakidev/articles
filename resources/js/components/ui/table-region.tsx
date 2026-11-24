import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Tabela larga com rolagem horizontal própria, alcançável pelo teclado e
 * com nome para leitores de tela. O `relative` prende dentro dela os textos
 * só para leitores de tela (`sr-only`), que são de posição absoluta e, sem
 * isso, esticavam a página no celular.
 */
export default function TableRegion({
    label,
    className,
    children,
}: {
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            tabIndex={0}
            role="region"
            aria-label={label}
            className={cn(
                'relative overflow-x-auto rounded-card border border-border bg-surface',
                className,
            )}
        >
            {children}
        </div>
    );
}
