import { Head, Link } from '@inertiajs/react';
import { Info, Lightbulb } from 'lucide-react';
import ArticleCard from '@/components/articles/article-card';
import {
    applyFilters,
    filterUrl,
    useFilterBar,
} from '@/components/search/filter-bar';
import type {
    SearchOptions,
    SearchQuery,
} from '@/components/search/search-filters';
import SearchForm from '@/components/search/search-form';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import Pagination from '@/components/ui/pagination';
import { useTranslation } from '@/lib/i18n';
import { index as articles } from '@/routes/articles';
import type { ArticleSummary } from '@/types';

type Props = {
    query: SearchQuery;
    filterCount: number;
    /** A busca tem termo curto (Go, JS, UI), que o índice não pega (D85). */
    shortTerms: boolean;
    results: {
        data: ArticleSummary[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
    /** Sem resultado: os mais recentes da categoria escolhida, ou de todas. */
    suggested: ArticleSummary[];
    options: SearchOptions;
    /** Nome da categoria filtrada. */
    category: string | null;
};

/**
 * Busca (pranchas "Busca com filtros" e "Busca sem resultados", RF-130 a
 * RF-136): termo, filtros que já buscam ao mudar, filtros ativos que se
 * removem um a um e, sem resultado, dicas e sugestões.
 */
export default function SearchPage({
    query,
    filterCount,
    shortTerms,
    results,
    suggested,
    options,
    category,
}: Props) {
    const { t } = useTranslation();
    const bar = useFilterBar({
        page: 'search',
        query,
        options,
        filterCount,
        total: results.total,
    });

    return (
        <>
            <Head
                title={
                    query.q
                        ? t('search.page_title', { q: query.q })
                        : t('search.title')
                }
            />

            <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 pt-6 pb-24 sm:px-8 md:pt-8">
                <SearchForm
                    id="busca-pagina"
                    initial={query.q}
                    size="lg"
                    className="lg:hidden"
                />

                {results.total > 0 ? (
                    <div className="flex flex-wrap items-center gap-4">
                        <Mascot
                            art="procurando"
                            size={96}
                            float
                            className="hidden sm:block"
                        />
                        <div className="min-w-70 flex-1">
                            <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                                {heading(query.q, results.total, t)}
                            </h1>
                            <p className="mt-1.5 text-label text-text-secondary">
                                {t('search.scope')}
                            </p>
                        </div>
                        {bar.controls}
                    </div>
                ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-muted px-5 py-3">
                        <p className="text-label">
                            {category
                                ? t('search.searching_in', {
                                      q: query.q,
                                      category,
                                  })
                                : t('search.searching', { q: query.q })}
                        </p>
                        {bar.toggle}
                    </div>
                )}

                {bar.panel}

                {results.total > 0 ? (
                    <>
                        {shortTerms && <ShortTermsNotice />}
                        <h2 className="sr-only">{t('search.results')}</h2>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
                            {results.data.map((article) => (
                                <ArticleCard
                                    key={article.url}
                                    article={article}
                                />
                            ))}
                        </div>
                        <Pagination
                            current={results.currentPage}
                            last={results.lastPage}
                            href={(page) => filterUrl('search', query, page)}
                        />
                    </>
                ) : (
                    <NoResults
                        query={query}
                        category={category}
                        suggested={suggested}
                        onAllCategories={() =>
                            applyFilters('search', query, { categoria: null })
                        }
                    />
                )}
            </div>
        </>
    );
}

function heading(
    q: string,
    total: number,
    t: ReturnType<typeof useTranslation>['t'],
): string {
    if (!q) {
        return total === 1
            ? t('search.count_one')
            : t('search.count', { count: total });
    }

    return total === 1
        ? t('search.results_for_one', { q })
        : t('search.results_for', { count: total, q });
}

/** Termos com menos de 3 letras só acham título, categoria e tag (D85). */
function ShortTermsNotice() {
    const { t } = useTranslation();

    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-border bg-surface-muted p-4"
        >
            <Info
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-primary-text"
            />
            <div className="flex flex-col gap-0.5">
                <strong className="text-label">
                    {t('search.short_terms.title')}
                </strong>
                <span className="text-meta text-text-secondary">
                    {t('search.short_terms.text')}
                </span>
            </div>
        </div>
    );
}

const ripples = [220, 290, 360];

/** "Nenhum artigo encontrado": dicas, saídas e os mais recentes. */
function NoResults({
    query,
    category,
    suggested,
    onAllCategories,
}: {
    query: SearchQuery;
    category: string | null;
    suggested: ArticleSummary[];
    onAllCategories: () => void;
}) {
    const { t } = useTranslation();
    const tips = [
        t('search.empty.tip_spelling'),
        t('search.empty.tip_general'),
        ...(category ? [t('search.empty.tip_category')] : []),
    ];

    return (
        <>
            <section className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 py-6">
                <div className="relative flex items-center justify-center p-6">
                    {ripples.map((size, index) => (
                        <span
                            key={size}
                            aria-hidden="true"
                            className="ripple max-sm:hidden"
                            style={{
                                width: size,
                                height: size,
                                animationDelay: `${index * 0.7}s`,
                            }}
                        />
                    ))}
                    <Mascot
                        art="pensativo"
                        size={200}
                        float
                        className="relative max-w-[50vw]"
                    />
                </div>
                <div className="flex flex-[0_1_520px] flex-col items-start gap-4">
                    <h1 className="font-display text-[2rem]/10 font-extrabold tracking-[-0.02em]">
                        {query.q
                            ? t('search.empty.title', { q: query.q })
                            : t('search.empty.title_filters')}
                    </h1>
                    <ul className="flex flex-col gap-2">
                        {tips.map((tip) => (
                            <li
                                key={tip}
                                className="flex items-start gap-2 text-label text-text-secondary"
                            >
                                <Lightbulb
                                    aria-hidden="true"
                                    className="mt-0.5 size-[18px] shrink-0 text-primary-text"
                                />
                                {tip}
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-wrap gap-2.5">
                        {category && (
                            <Button
                                type="button"
                                size="md"
                                onClick={onAllCategories}
                            >
                                {t('search.empty.all_categories')}
                            </Button>
                        )}
                        <Button
                            asChild
                            size="md"
                            variant={category ? 'outline' : 'default'}
                        >
                            <Link href={articles()}>
                                {t('search.empty.all_articles')}
                            </Link>
                        </Button>
                    </div>
                    <ShortTermsNotice />
                </div>
            </section>

            {suggested.length > 0 && (
                <section
                    aria-labelledby="sugestoes"
                    className="flex flex-col gap-5"
                >
                    <h2
                        id="sugestoes"
                        className="font-display text-h3 font-extrabold"
                    >
                        {category
                            ? t('search.empty.recent_in', { category })
                            : t('search.empty.recent')}
                    </h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
                        {suggested.map((article) => (
                            <ArticleCard key={article.url} article={article} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
