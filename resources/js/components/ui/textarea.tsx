import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Texto de várias linhas, com o raio dos blocos internos (D76). */
export default function Textarea({
    className,
    ...props
}: ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'block min-h-24 w-full rounded-inner border border-border-strong bg-surface px-5 py-3 text-body text-text-primary placeholder:text-text-muted disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-text',
                'aria-invalid:border-2 aria-invalid:border-danger-fg',
                className,
            )}
            {...props}
        />
    );
}
