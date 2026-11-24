import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { useMotionPause } from '@/hooks/use-motion-pause';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Tempo de cada exemplo no lugar do placeholder. */
const HINT_MS = 2500;

/**
 * Exemplo da vez. Troca o texto de uma vez, sem esmaecer, para o contraste
 * ficar sempre inteiro; para com "Pausar animações" e "reduzir movimento".
 */
function useRotatingHint(hints: string[] | undefined): string | undefined {
    const { paused } = useMotionPause();
    const [index, setIndex] = useState(0);
    const count = hints?.length ?? 0;

    useEffect(() => {
        const reduced = window.matchMedia?.(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (count < 2 || paused || reduced) {
            return;
        }

        const timer = setInterval(
            () => setIndex((current) => (current + 1) % count),
            HINT_MS,
        );

        return () => clearInterval(timer);
    }, [count, paused]);

    return hints?.[index % Math.max(count, 1)];
}

/**
 * Campo de busca com a lupa e, opcionalmente, exemplos que se revezam no
 * lugar do placeholder (DESIGN §7, RotatingPlaceholder). O rótulo nunca
 * muda: os exemplos ficam fora do leitor de tela e somem ao digitar.
 */
export default function SearchField({
    id,
    label,
    hints,
    onClear,
    className,
    value,
    defaultValue,
    onChange,
    ...props
}: Omit<ComponentProps<'input'>, 'type'> & {
    id: string;
    label: string;
    /** Até três exemplos, em rodízio. */
    hints?: string[];
    /** Mostra o "Limpar busca" quando há texto. */
    onClear?: () => void;
}) {
    const { t } = useTranslation();
    const [text, setText] = useState(String(value ?? defaultValue ?? ''));
    const [focused, setFocused] = useState(false);
    const current = value === undefined ? text : String(value);
    const hint = useRotatingHint(hints);
    const showHints = hint !== undefined && current === '' && !focused;

    return (
        <div className={cn('relative', className)}>
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-text-secondary"
            />
            <input
                id={id}
                type="search"
                value={value}
                defaultValue={value === undefined ? defaultValue : undefined}
                onChange={(event) => {
                    setText(event.target.value);
                    onChange?.(event);
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                {...props}
                className={cn(
                    // O anel de foco cobre a borda: uma linha só, em vez de borda e anel
                    'h-11 w-full rounded-xl border border-border-strong bg-surface pr-3.5 pl-11 text-[0.9375rem] text-text-primary placeholder:text-text-secondary focus-visible:outline-offset-[-1px] [&::-webkit-search-cancel-button]:hidden',
                    onClear && current !== '' && 'pr-11',
                    props.placeholder === undefined && showHints && 'placeholder:text-transparent',
                )}
            />
            {showHints && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-11 flex items-center overflow-hidden text-[0.9375rem] text-text-secondary"
                >
                    {hint}
                </span>
            )}
            {onClear && current !== '' && (
                <button
                    type="button"
                    aria-label={t('search.clear')}
                    onClick={() => {
                        setText('');
                        onClear();
                    }}
                    className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                >
                    <X aria-hidden="true" className="size-4" />
                </button>
            )}
        </div>
    );
}
