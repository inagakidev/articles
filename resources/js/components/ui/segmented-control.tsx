import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Option<T extends string> = {
    value: T;
    label: string;
    Icon?: LucideIcon;
    /** Idioma do rótulo, quando ele está em outro idioma (nome do idioma). */
    lang?: string;
};

/**
 * Escolha entre poucas opções lado a lado (tema, idioma). É um grupo de
 * rádios nativos: setas trocam a opção e o leitor de tela anuncia o grupo.
 */
export default function SegmentedControl<T extends string>({
    name,
    label,
    value,
    options,
    onChange,
    className,
}: {
    name: string;
    /** Nome do grupo para leitores de tela. */
    label: string;
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
    className?: string;
}) {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className={cn(
                'inline-flex flex-wrap gap-1 rounded-full bg-surface-muted p-1',
                className,
            )}
        >
            {options.map((option) => (
                <label
                    key={option.value}
                    lang={option.lang}
                    className="relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-meta font-semibold text-text-secondary transition-colors duration-(--duration-fast) has-checked:bg-surface has-checked:font-extrabold has-checked:text-text-primary has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                        className="sr-only"
                    />
                    {option.Icon && (
                        <option.Icon aria-hidden="true" className="size-4" />
                    )}
                    {option.label}
                </label>
            ))}
        </div>
    );
}
