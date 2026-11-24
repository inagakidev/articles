import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Escolha única em chips (filtros da busca). São rádios nativos: as setas
 * trocam a opção e o leitor de tela anuncia o grupo pela legenda.
 */
export default function ChoiceChips<T extends string>({
    name,
    value,
    options,
    onChange,
}: {
    name: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {options.map((option) => (
                <label
                    key={option.value}
                    className={cn(
                        'inline-flex h-9 cursor-pointer items-center gap-1 rounded-full bg-surface px-3 text-meta font-semibold ring-1 ring-border-strong ring-inset',
                        'has-checked:bg-surface-selected has-checked:font-bold has-checked:text-text-on-selected has-checked:ring-2 has-checked:ring-primary',
                        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
                    )}
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                        className="peer sr-only"
                    />
                    <Check
                        aria-hidden="true"
                        className="hidden size-4 peer-checked:block"
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
}
