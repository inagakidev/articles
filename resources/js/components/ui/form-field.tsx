import type { ReactNode } from 'react';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** O que o campo recebe para ficar ligado ao rótulo, à dica e ao erro. */
export type FieldProps = {
    id: string;
    'aria-invalid': true | undefined;
    'aria-describedby': string | undefined;
};

/**
 * Rótulo, campo, dica e erro das pranchas (DESIGN §7.4). A dica e o erro
 * ficam ligados ao campo por `aria-describedby`, e o erro marca `aria-invalid`.
 */
export default function FormField({
    id,
    label,
    error,
    hint,
    className,
    children,
}: {
    id: string;
    label: ReactNode;
    error?: string;
    /** Texto de apoio abaixo do campo ("Mínimo de 8 caracteres"). */
    hint?: ReactNode;
    className?: string;
    children: (field: FieldProps) => ReactNode;
}) {
    const describedBy =
        [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
            .filter(Boolean)
            .join(' ') || undefined;

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <Label htmlFor={id} className="text-meta font-bold">
                {label}
            </Label>
            {children({
                id,
                'aria-invalid': error ? true : undefined,
                'aria-describedby': describedBy,
            })}
            {hint && (
                <div id={`${id}-hint`} className="text-caption text-text-secondary">
                    {hint}
                </div>
            )}
            <InputError id={`${id}-error`} message={error} />
        </div>
    );
}
