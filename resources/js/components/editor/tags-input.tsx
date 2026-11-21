import { X } from 'lucide-react';
import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from '@/lib/i18n';

/**
 * Tags livres (RF-093, RF-127): Enter ou vírgula adiciona. O servidor
 * normaliza e junta variações (RF-128); aqui só evita repetir na hora.
 */
export default function TagsInput({
    id,
    value,
    max,
    onChange,
    describedBy,
}: {
    id: string;
    value: string[];
    max: number;
    onChange: (tags: string[]) => void;
    describedBy?: string;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState('');

    function add(raw: string) {
        const tag = raw.trim().replace(/,$/, '').trim();
        const exists = value.some(
            (item) => item.toLowerCase() === tag.toLowerCase(),
        );

        if (tag && !exists && value.length < max) {
            onChange([...value, tag]);
        }

        setDraft('');
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            add(draft);
        } else if (
            event.key === 'Backspace' &&
            draft === '' &&
            value.length > 0
        ) {
            onChange(value.slice(0, -1));
        }
    }

    return (
        <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-inner border border-border-strong bg-surface px-3 py-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
            <ul className="contents">
                {value.map((tag) => (
                    <li
                        key={tag}
                        className="inline-flex h-7 items-center gap-1 rounded-full bg-surface-muted pr-1 pl-3 font-mono text-caption font-bold"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() =>
                                onChange(value.filter((item) => item !== tag))
                            }
                            aria-label={t('editor.details.tag_remove', { tag })}
                            className="inline-flex size-5 items-center justify-center rounded-full hover:bg-surface-selected"
                        >
                            <X aria-hidden="true" className="size-3.5" />
                        </button>
                    </li>
                ))}
            </ul>
            <input
                id={id}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => draft && add(draft)}
                disabled={value.length >= max}
                aria-describedby={describedBy}
                autoComplete="off"
                className="h-8 min-w-24 flex-1 bg-transparent text-meta outline-none"
            />
        </div>
    );
}
