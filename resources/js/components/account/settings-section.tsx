import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Um cartão das Configurações: título, texto de apoio e o conteúdo. */
export default function SettingsSection({
    id,
    title,
    description,
    className,
    children,
}: {
    id: string;
    title: string;
    description?: ReactNode;
    className?: string;
    children: ReactNode;
}) {
    return (
        <section
            aria-labelledby={`${id}-title`}
            className={cn(
                'flex animate-rise flex-col gap-5 rounded-card border border-border bg-surface p-5 sm:p-7',
                className,
            )}
        >
            <div>
                <h2
                    id={`${id}-title`}
                    className="font-display text-[1.25rem] font-extrabold"
                >
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-meta text-text-secondary">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </section>
    );
}
