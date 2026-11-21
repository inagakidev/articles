import type { ReactNode } from 'react';
import type { PastelTone } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Pastéis fixos (DESIGN §2.7), sempre com o texto do par. Usados em
 * categorias, tags, capas e avatar sem foto.
 */
export const pastelTones = {
    lavender: 'bg-pastel-lavender text-pastel-lavender-fg',
    lilac: 'bg-pastel-lilac text-pastel-lilac-fg',
    mint: 'bg-pastel-mint text-pastel-mint-fg',
    yellow: 'bg-pastel-yellow text-pastel-yellow-fg',
    pink: 'bg-pastel-pink text-pastel-pink-fg',
    blue: 'bg-pastel-blue text-pastel-blue-fg',
    peach: 'bg-pastel-peach text-pastel-peach-fg',
} satisfies Record<PastelTone, string>;

const sizes = {
    sm: 'px-3 py-1 text-caption',
    md: 'px-[18px] py-2 text-label',
};

export default function Pill({
    tone,
    size = 'sm',
    className,
    children,
}: {
    tone: PastelTone;
    size?: keyof typeof sizes;
    className?: string;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full leading-5 font-bold whitespace-nowrap',
                pastelTones[tone],
                sizes[size],
                className,
            )}
        >
            {children}
        </span>
    );
}
