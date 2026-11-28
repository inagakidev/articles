import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * O mascote no centro de ondas que se espalham (estados vazios, 404, fim da
 * leitura, chamada final da landing). As ondas param com "Pausar
 * animações" e com "reduzir movimento" (`.ripple`).
 */
export default function MascotStage({
    ripples,
    step = 0.7,
    hideRipplesOnMobile = false,
    className,
    children,
}: {
    /** Diâmetro de cada onda, em pixels, da menor para a maior. */
    ripples: number[];
    /** Segundos entre uma onda e a seguinte. */
    step?: number;
    /** No celular, só o mascote: as ondas não cabem. */
    hideRipplesOnMobile?: boolean;
    className?: string;
    /** O mascote; precisa de `relative` para ficar acima das ondas. */
    children: ReactNode;
}) {
    return (
        <div className={cn('relative flex items-center justify-center', className)}>
            {ripples.map((size, index) => (
                <span
                    key={size}
                    aria-hidden="true"
                    className={cn('ripple', hideRipplesOnMobile && 'max-sm:hidden')}
                    style={{ width: size, height: size, animationDelay: `${index * step}s` }}
                />
            ))}
            {children}
        </div>
    );
}
