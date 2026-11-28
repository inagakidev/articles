import { useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
export default function TitleField({
    value,
    max,
    error,
    onChange,
    onEnter,
}: {
    value: string;
    max: number;
    error?: string;
    onChange: (value: string) => void;
    onEnter: () => void;
}) {
    const { t } = useTranslation();
    const input = useRef<HTMLTextAreaElement>(null);

    // O título cresce com o texto, sem barra de rolagem.
    useEffect(() => {
        const element = input.current;

        if (element) {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className="mb-6 flex flex-col gap-1">
            <label htmlFor="title" className="sr-only">
                {t('editor.title')}
            </label>
            <textarea
                ref={input}
                id="title"
                rows={1}
                value={value}
                maxLength={max}
                placeholder={t('editor.title_placeholder')}
                aria-describedby="title-count"
                aria-invalid={error ? true : undefined}
                onChange={(event) =>
                    onChange(event.target.value.replace(/\n/g, ' '))
                }
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        onEnter();
                    }
                }}
                className="w-full resize-none overflow-hidden bg-transparent font-display text-[2.25rem]/11 font-extrabold tracking-[-0.02em] text-text-primary outline-none placeholder:text-text-muted"
            />
            <span
                id="title-count"
                className="self-end text-caption text-text-secondary"
            >
                {t('editor.title_count', { count: value.length, max })}
            </span>
            {error && <span className="text-meta text-danger-fg">{error}</span>}
        </div>
    );
}
