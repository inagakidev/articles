import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Páginas em volta da atual antes do "…". */
const AROUND = 1;

/**
 * As páginas a mostrar: a primeira, a última e as vizinhas da atual, com
 * `null` onde entra o "…" (prancha "Home": 1 2 3 … 12).
 */
export function pageWindow(current: number, last: number): (number | null)[] {
    const pages: (number | null)[] = [];

    for (let page = 1; page <= last; page++) {
        const near = Math.abs(page - current) <= AROUND;
        const edge = page === 1 || page === last;
        // Do lado do começo, a janela também mostra a terceira página
        const start = current <= AROUND + 2 && page <= AROUND + 2;

        if (near || edge || start) {
            pages.push(page);
        } else if (pages.at(-1) !== null) {
            pages.push(null);
        }
    }

    return pages;
}

const step =
    'inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[0.9375rem] font-bold';

/**
 * Paginação numerada (RF-133). No celular, só "Página X de Y" entre as
 * setas, como na prancha.
 */
export default function Pagination({
    current,
    last,
    href,
}: {
    current: number;
    last: number;
    href: (page: number) => string;
}) {
    const { t } = useTranslation();

    if (last <= 1) {
        return null;
    }

    return (
        <nav
            aria-label={t('pagination.label')}
            className="flex items-center justify-center gap-1"
        >
            {current > 1 ? (
                <Link
                    href={href(current - 1)}
                    rel="prev"
                    className={cn(step, 'text-primary-text hover:bg-surface-hover')}
                >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                    {t('pagination.previous')}
                </Link>
            ) : (
                <span
                    aria-disabled="true"
                    className={cn(step, 'text-border-strong')}
                >
                    <ChevronLeft aria-hidden="true" className="size-4" />
                    {t('pagination.previous')}
                </span>
            )}

            <span className="px-2 text-meta font-semibold text-text-secondary sm:hidden">
                {t('pagination.page_of', { current, last })}
            </span>

            {pageWindow(current, last).map((page, index) =>
                page === null ? (
                    <span
                        key={`gap-${index}`}
                        aria-hidden="true"
                        className="hidden w-10 text-center text-text-secondary sm:inline"
                    >
                        …
                    </span>
                ) : (
                    <Link
                        key={page}
                        href={href(page)}
                        aria-current={page === current ? 'page' : undefined}
                        aria-label={t('pagination.page', { page })}
                        className={cn(
                            'hidden size-10 items-center justify-center rounded-xl text-[0.9375rem] font-semibold sm:inline-flex',
                            page === current
                                ? 'bg-primary font-bold text-text-on-primary'
                                : 'hover:bg-surface-hover',
                        )}
                    >
                        {page}
                    </Link>
                ),
            )}

            {current < last ? (
                <Link
                    href={href(current + 1)}
                    rel="next"
                    className={cn(step, 'text-primary-text hover:bg-surface-hover')}
                >
                    {t('pagination.next')}
                    <ChevronRight aria-hidden="true" className="size-4" />
                </Link>
            ) : (
                <span
                    aria-disabled="true"
                    className={cn(step, 'text-border-strong')}
                >
                    {t('pagination.next')}
                    <ChevronRight aria-hidden="true" className="size-4" />
                </span>
            )}
        </nav>
    );
}
