import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import ChoiceChips from '@/components/ui/choice-chips';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

/** Os parâmetros da busca, como estão no endereço. */
export type SearchQuery = {
    q: string;
    categoria: string | null;
    autor: string | null;
    idioma: string | null;
    tags: string[];
    periodo: 'mes' | 'semestre' | 'ano' | null;
    ordem: 'recentes' | 'antigos';
};

export type SearchOptions = {
    categories: { slug: string; name: string }[];
    languages: Locale[];
    tags: string[];
};

/** Tags que dá para combinar de uma vez (`SearchRequest::MAX_TAGS`). */
export const MAX_TAGS = 5;

/** Espera antes de buscar enquanto a pessoa digita o autor. */
const AUTHOR_DELAY = 400;

const selectClass =
    'h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-text-primary focus-visible:outline-offset-[-1px]';

/**
 * Os filtros da busca (RF-131, prancha "Busca com filtros"): categoria,
 * autor, idioma, tags e período da primeira publicação. Cada mudança já
 * busca; a popularidade entra com as curtidas (fatia 17).
 */
export default function SearchFilters({
    query,
    options,
    onChange,
    idPrefix,
}: {
    query: SearchQuery;
    options: SearchOptions;
    onChange: (changes: Partial<SearchQuery>) => void;
    /** Os filtros aparecem no painel e na folha do celular, com ids próprios. */
    idPrefix: string;
}) {
    const { t } = useTranslation();
    const [author, setAuthor] = useState(query.autor ?? '');
    const authorTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(authorTimer.current), []);

    function typeAuthor(value: string) {
        setAuthor(value);
        clearTimeout(authorTimer.current);
        authorTimer.current = setTimeout(
            () => onChange({ autor: value.trim() || null }),
            AUTHOR_DELAY,
        );
    }

    return (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
            <Field legend={t('search.filters.category')}>
                <select
                    aria-label={t('search.filters.category')}
                    value={query.categoria ?? ''}
                    onChange={(event) =>
                        onChange({ categoria: event.target.value || null })
                    }
                    className={selectClass}
                >
                    <option value="">
                        {t('search.filters.all_categories')}
                    </option>
                    {options.categories.map((category) => (
                        <option key={category.slug} value={category.slug}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </Field>

            <Field legend={t('search.filters.author')}>
                <input
                    id={`${idPrefix}-autor`}
                    aria-label={t('search.filters.author')}
                    value={author}
                    onChange={(event) => typeAuthor(event.target.value)}
                    placeholder={t('search.filters.author_placeholder')}
                    maxLength={60}
                    autoComplete="off"
                    className={`${selectClass} px-3.5 placeholder:text-text-secondary`}
                />
            </Field>

            <Field legend={t('search.filters.language')}>
                <select
                    aria-label={t('search.filters.language')}
                    value={query.idioma ?? ''}
                    onChange={(event) =>
                        onChange({ idioma: event.target.value || null })
                    }
                    className={selectClass}
                >
                    <option value="">
                        {t('search.filters.all_languages')}
                    </option>
                    {options.languages.map((language) => (
                        <option key={language} value={language}>
                            {t(`search.filters.languages.${language}`)}
                        </option>
                    ))}
                </select>
            </Field>

            <Field legend={t('search.filters.tags')}>
                <TagPicker
                    id={`${idPrefix}-tag`}
                    tags={query.tags}
                    suggestions={options.tags}
                    onChange={(tags) => onChange({ tags })}
                />
            </Field>

            <Field
                legend={t('search.filters.period')}
                className="md:col-span-2"
            >
                <ChoiceChips
                    name={`${idPrefix}-periodo`}
                    value={query.periodo ?? 'qualquer'}
                    onChange={(value) =>
                        onChange({
                            periodo:
                                value === 'qualquer'
                                    ? null
                                    : (value as SearchQuery['periodo']),
                        })
                    }
                    options={[
                        {
                            value: 'qualquer',
                            label: t('search.filters.any_date'),
                        },
                        { value: 'mes', label: t('search.filters.last_month') },
                        {
                            value: 'semestre',
                            label: t('search.filters.last_semester'),
                        },
                        { value: 'ano', label: t('search.filters.last_year') },
                    ]}
                />
            </Field>
        </div>
    );
}

function Field({
    legend,
    className,
    children,
}: {
    legend: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <fieldset className={`flex min-w-0 flex-col gap-2 ${className ?? ''}`}>
            <legend className="mb-2 text-meta font-bold">{legend}</legend>
            {children}
        </fieldset>
    );
}

/** As tags escolhidas, cada uma com "Remover", e o "+ Tag" com sugestões. */
function TagPicker({
    id,
    tags,
    suggestions,
    onChange,
}: {
    id: string;
    tags: string[];
    suggestions: string[];
    onChange: (tags: string[]) => void;
}) {
    const { t } = useTranslation();
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState('');

    function add() {
        const tag = draft.trim().toLowerCase().replace(/^#/, '');
        setDraft('');
        setAdding(false);

        if (tag !== '' && !tags.includes(tag) && tags.length < MAX_TAGS) {
            onChange([...tags, tag]);
        }
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            event.preventDefault();
            add();
        } else if (event.key === 'Escape') {
            setDraft('');
            setAdding(false);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-muted pr-1.5 pl-3 text-meta font-bold ring-1 ring-pastel-lavender ring-inset dark:ring-border"
                >
                    {tag}
                    <button
                        type="button"
                        aria-label={t('search.filters.remove_tag', { tag })}
                        onClick={() =>
                            onChange(tags.filter((item) => item !== tag))
                        }
                        className="inline-flex size-6 items-center justify-center rounded-full hover:bg-surface-hover"
                    >
                        <X aria-hidden="true" className="size-3.5" />
                    </button>
                </span>
            ))}
            {adding ? (
                <>
                    <input
                        id={id}
                        autoFocus
                        aria-label={t('search.filters.tag_input')}
                        list={`${id}-sugestoes`}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onKeyDown}
                        onBlur={add}
                        maxLength={40}
                        className="h-8 w-36 rounded-full border border-border-strong bg-surface px-3 text-meta"
                    />
                    <datalist id={`${id}-sugestoes`}>
                        {suggestions
                            .filter((tag) => !tags.includes(tag))
                            .map((tag) => (
                                <option key={tag} value={tag} />
                            ))}
                    </datalist>
                </>
            ) : (
                tags.length < MAX_TAGS && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        className="h-8 rounded-full border border-dashed border-border-strong px-3 text-meta font-bold hover:bg-surface-hover"
                    >
                        {t('search.filters.add_tag')}
                    </button>
                )
            )}
        </div>
    );
}
