import { Bookmark, CircleCheck, Code, PenLine } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * O mascote no centro de duas órbitas tracejadas, com ícones e pontos que
 * giram um quarto de volta e param (pranchas de entrar, criar conta e início).
 * Tudo aqui é decoração: o mascote vem como filho e já é decorativo.
 */
const icons = [
    { Icon: PenLine, angle: 0, className: 'text-primary-text' },
    { Icon: Code, angle: 90, className: 'text-primary-text' },
    { Icon: Bookmark, angle: 180, className: 'text-primary-text' },
    { Icon: CircleCheck, angle: 270, className: 'text-success-fg' },
];

const dots = [
    { angle: 45, className: 'bg-pastel-pink' },
    { angle: 165, className: 'bg-pastel-yellow' },
    { angle: 285, className: 'bg-pastel-mint' },
];

/** Raio das órbitas e lado do quadro em cada tamanho. */
const sizes = {
    // Abertura da página de apresentação
    lg: {
        outer: 'min(200px, 40vw)',
        inner: 'min(150px, 30vw)',
        box: 'w-[min(460px,92vw)]',
        icon: 'size-[26px]',
    },
    md: {
        outer: 'min(175px, 40vw)',
        inner: 'min(128px, 30vw)',
        box: 'w-[min(400px,92vw)]',
        icon: 'size-[26px]',
    },
    // Palco do celular (D68): o mascote menor, sem disputar com o formulário.
    sm: {
        outer: '104px',
        inner: '76px',
        box: 'w-60',
        icon: 'size-5',
    },
};

function position(radius: string, angle: number) {
    return {
        '--orbit-radius': radius,
        '--orbit-angle': `${angle}deg`,
    } as CSSProperties;
}

export default function MascotOrbit({
    children,
    size = 'md',
    className,
}: {
    children: ReactNode;
    size?: keyof typeof sizes;
    className?: string;
}) {
    const { outer, inner, box, icon } = sizes[size];

    return (
        <div
            className={cn(
                'relative flex aspect-square items-center justify-center',
                box,
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="absolute rounded-full border-[1.5px] border-dashed border-pastel-lavender"
                style={{ inset: `calc(50% - ${outer})` }}
            />
            <span
                aria-hidden="true"
                className="absolute rounded-full border-[1.5px] border-dashed border-surface-selected"
                style={{ inset: `calc(50% - ${inner})` }}
            />
            {icons.map(({ Icon, angle, className: color }) => (
                <span
                    key={angle}
                    aria-hidden="true"
                    className="orbit-item inline-flex size-12 items-center justify-center opacity-80"
                    style={position(outer, angle)}
                >
                    <Icon className={cn(icon, color)} />
                </span>
            ))}
            {dots.map(({ angle, className: color }) => (
                <span
                    key={angle}
                    aria-hidden="true"
                    className="orbit-item orbit-item-reverse inline-flex size-12 items-center justify-center"
                    style={position(inner, angle)}
                >
                    <span className={cn('size-4 rounded-full', color)} />
                </span>
            ))}
            <div className="relative animate-float">{children}</div>
        </div>
    );
}
