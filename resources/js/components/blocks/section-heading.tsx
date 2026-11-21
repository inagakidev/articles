import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Sobretítulo, título e linha de apoio de cada seção da apresentação. */
export default function SectionHeading({
    id,
    eyebrow,
    title,
    lead,
    align = 'center',
}: {
    /** Id do título, para o aria-labelledby da seção. */
    id: string;
    eyebrow: string;
    title: string;
    lead: ReactNode;
    align?: 'center' | 'start';
}) {
    return (
        <div
            className={cn(
                'reveal flex max-w-180 flex-col gap-3.5',
                align === 'center'
                    ? 'mx-auto items-center text-center'
                    : 'items-start',
            )}
        >
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3.5 py-1.5 text-caption font-extrabold tracking-[0.1em] text-primary-text uppercase ring-1 ring-pastel-lavender ring-inset dark:ring-border">
                <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-primary"
                />
                {eyebrow}
            </span>
            <h2
                id={id}
                className="text-[clamp(2rem,4.2vw,3rem)] leading-[1.12] font-extrabold tracking-[-0.03em]"
            >
                {title}
            </h2>
            <p className="text-[1.125rem]/7 text-text-secondary">{lead}</p>
        </div>
    );
}

/** Largura e respiro laterais das seções (1200 px, como nas pranchas). */
export function LandingContainer({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'mx-auto w-full max-w-300 px-[clamp(16px,4vw,32px)]',
                className,
            )}
        >
            {children}
        </div>
    );
}
