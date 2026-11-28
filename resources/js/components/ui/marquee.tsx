import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Faixa que rola sem fim (efeito em css/app/effects.css). O conteúdo aparece duas vezes
 * para emendar o fim no começo; a cópia fica oculta para leitores de tela.
 * Pausa ao passar o mouse, com foco dentro ou com "Pausar animações".
 */
export default function Marquee({
    children,
    reverse = false,
    fast = false,
    className,
}: {
    children: ReactNode;
    reverse?: boolean;
    fast?: boolean;
    className?: string;
}) {
    return (
        <div className={cn('marquee', className)}>
            <div
                className={cn(
                    'marquee-track',
                    reverse && 'marquee-reverse',
                    fast && 'marquee-fast',
                )}
            >
                <div>{children}</div>
                <div aria-hidden="true" inert>
                    {children}
                </div>
            </div>
        </div>
    );
}
