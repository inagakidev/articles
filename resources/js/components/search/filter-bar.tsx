import { router } from '@inertiajs/react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import SearchFilters from '@/components/search/search-filters';
import type {
    SearchOptions,
    SearchQuery,
} from '@/components/search/search-filters';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { search } from '@/routes';
import { index as articles } from '@/routes/articles';

/** Onde os filtros moram: a listagem (`/artigos`) ou a busca (`/busca`). */
export type FilterPage = 'articles' | 'search';

/** O endereço sem os parâmetros vazios, para ficar curto e compartilhável. */
export function filterUrl(
    page: FilterPage,
    query: SearchQuery,
    pageNumber = 1,
): string {
    const params: Record<string, string | number | string[]> = {};

    if (query.q) params.q = query.q;
    if (query.categoria) params.categoria = query.categoria;
    if (query.autor) params.autor = query.autor;
    if (query.idioma) params.idioma = query.idioma;
    if (query.tags.length > 0) params.tags = query.tags;
    if (query.periodo) params.periodo = query.periodo;
    if (query.ordem === 'antigos') params.ordem = query.ordem;
    if (pageNumber > 1) params.page = pageNumber;

    const route = page === 'search' ? search : articles;

    return route({ query: params }).url;
}

/** Leva a uma nova combinação de filtros, sem perder a rolagem nem o painel. */
export function applyFilters(
    page: FilterPage,
    query: SearchQuery,
    changes: Partial<SearchQuery>,
): void {
    router.get(
        filterUrl(page, { ...query, ...changes }),
        {},
        { preserveState: true, preserveScroll: true, replace: true },
    );
}

export const NO_FILTERS: Partial<SearchQuery> = {
    categoria: null,
    autor: null,
    idioma: null,
    tags: [],
    periodo: null,
};

/**
 * "Ordenar por" e "Filtros" (pranchas "Home" e "Busca com filtros"). No
 * desktop, os filtros abrem num painel abaixo; no celular, numa folha que
 * sobe. Os filtros ligados aparecem como chips removíveis. Devolve os
 * controles e o painel separados, porque cada página os põe num lugar.
 */
export function useFilterBar({
    page,
    query,
    options,
    filterCount,
    total,
}: {
    page: FilterPage;
    query: SearchQuery;
    options: SearchOptions;
    filterCount: number;
    total: number;
}) {
    const { t } = useTranslation();
    const [panelOpen, setPanelOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);
    const apply = (changes: Partial<SearchQuery>) =>
        applyFilters(page, query, changes);

    function toggle() {
        if (window.matchMedia('(min-width: 768px)').matches) {
            setPanelOpen((open) => !open);
        } else {
            setSheetOpen(true);
        }
    }

    const filters = (idPrefix: string, onDone: () => void) => (
        <>
            <SearchFilters
                query={query}
                options={options}
                onChange={apply}
                idPrefix={idPrefix}
            />
            <div className="flex justify-end gap-2 border-t border-border pt-5">
                <Button
                    type="button"
                    variant="subtle"
                    size="md"
                    onClick={() => apply(NO_FILTERS)}
                    disabled={filterCount === 0}
                >
                    {t('search.filters.clear')}
                </Button>
                <Button type="button" size="md" onClick={onDone}>
                    {total === 1
                        ? t('search.filters.see_one')
                        : t('search.filters.see', { count: total })}
                </Button>
            </div>
        </>
    );

    const toggleButton = (
        <button
            type="button"
            aria-expanded={panelOpen}
            aria-controls={`${page}-painel-filtros`}
            onClick={toggle}
            className={cn(
                'inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[0.9375rem] font-bold',
                panelOpen || filterCount > 0
                    ? 'bg-surface-selected text-text-on-selected ring-2 ring-primary ring-inset'
                    : 'bg-surface ring-1 ring-border-strong ring-inset hover:bg-surface-hover',
            )}
        >
            <SlidersHorizontal aria-hidden="true" className="size-[18px]" />
            {filterCount > 0
                ? t('search.filters.button_count', {
                      count: filterCount,
                  })
                : t('search.filters.button')}
            <ChevronDown
                aria-hidden="true"
                className={cn(
                    'hidden size-4 transition-transform md:block',
                    panelOpen && 'rotate-180',
                )}
            />
        </button>
    );

    return {
        toggle: toggleButton,
        controls: (
            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor={`${page}-ordem`}
                        className="text-caption font-bold"
                    >
                        {t('search.sort.label')}
                    </label>
                    <select
                        id={`${page}-ordem`}
                        value={query.ordem}
                        onChange={(event) =>
                            apply({
                                ordem: event.target
                                    .value as SearchQuery['ordem'],
                            })
                        }
                        className="h-11 min-w-55 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] focus-visible:outline-offset-[-1px]"
                    >
                        <option value="recentes">
                            {t('search.sort.recent')}
                        </option>
                        <option value="antigos">
                            {t('search.sort.oldest')}
                        </option>
                    </select>
                </div>
                {toggleButton}
            </div>
        ),
        panel: (
            <>
                {panelOpen && (
                    <section
                        id={`${page}-painel-filtros`}
                        aria-label={t('search.filters.title')}
                        className="hidden flex-col gap-6 rounded-3xl border border-border bg-surface p-7 shadow-md md:flex"
                    >
                        {filters(`${page}-painel`, () => setPanelOpen(false))}
                    </section>
                )}

                {filterCount > 0 && (
                    <ActiveFilters
                        query={query}
                        options={options}
                        onChange={apply}
                    />
                )}

                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent
                        side="bottom"
                        className="max-h-[88svh] gap-6 overflow-y-auto rounded-t-section p-5 md:hidden"
                    >
                        <SheetTitle className="font-display text-h3 font-extrabold">
                            {t('search.filters.title')}
                        </SheetTitle>
                        {filters(`${page}-folha`, () => setSheetOpen(false))}
                    </SheetContent>
                </Sheet>
            </>
        ),
    };
}

/** "Filtros ativos": cada filtro ligado, com o próprio "Remover". */
function ActiveFilters({
    query,
    options,
    onChange,
}: {
    query: SearchQuery;
    options: SearchOptions;
    onChange: (changes: Partial<SearchQuery>) => void;
}) {
    const { t } = useTranslation();
    const chips: { label: string; remove: Partial<SearchQuery> }[] = [];

    if (query.categoria) {
        chips.push({
            label:
                options.categories.find((item) => item.slug === query.categoria)
                    ?.name ?? query.categoria,
            remove: { categoria: null },
        });
    }

    if (query.autor) {
        chips.push({ label: query.autor, remove: { autor: null } });
    }

    if (query.idioma) {
        chips.push({
            label: t(`search.filters.languages.${query.idioma}` as never),
            remove: { idioma: null },
        });
    }

    for (const tag of query.tags) {
        chips.push({
            label: `#${tag}`,
            remove: { tags: query.tags.filter((item) => item !== tag) },
        });
    }

    if (query.periodo) {
        const periods = {
            mes: t('search.filters.last_month'),
            semestre: t('search.filters.last_semester'),
            ano: t('search.filters.last_year'),
        };
        chips.push({
            label: periods[query.periodo],
            remove: { periodo: null },
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-meta font-bold text-text-secondary">
                {t('search.filters.active')}
            </span>
            {chips.map((chip) => (
                <span
                    key={chip.label}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-selected pr-1.5 pl-3 text-meta font-bold text-text-on-selected"
                >
                    {chip.label}
                    <button
                        type="button"
                        aria-label={t('search.filters.remove', {
                            filter: chip.label,
                        })}
                        onClick={() => onChange(chip.remove)}
                        className="inline-flex size-6 items-center justify-center rounded-full hover:bg-surface"
                    >
                        <X aria-hidden="true" className="size-3.5" />
                    </button>
                </span>
            ))}
            <button
                type="button"
                onClick={() => onChange(NO_FILTERS)}
                className="text-meta font-bold text-primary-text hover:underline"
            >
                {t('search.filters.clear')}
            </button>
        </div>
    );
}
