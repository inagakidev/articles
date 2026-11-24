import { Head, Link } from '@inertiajs/react';
import {
    ArrowDown,
    ChevronRight,
    CircleCheck,
    LayoutGrid,
    PenLine,
    Sparkles,
} from 'lucide-react';
import ArticleCard from '@/components/articles/article-card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Mascot from '@/components/ui/mascot';
import MascotOrbit from '@/components/ui/mascot-orbit';
import Pagination from '@/components/ui/pagination';
import { pastelTones } from '@/components/ui/pill';
import StatusBadge from '@/components/ui/status-badge';
import type { ArticleStatus } from '@/components/ui/status-badge';
import { useWriteHref } from '@/hooks/use-write-href';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { index } from '@/routes/articles';
import type { ArticleSummary, CategorySummary } from '@/types';

type Category = CategorySummary & { slug: string };

type Props = {
    categories: Category[];
    /** Slug da categoria escolhida; nulo em "Todas". */
    category: string | null;
    articles: {
        data: ArticleSummary[];
        currentPage: number;
        lastPage: number;
        total: number;
        from: number | null;
        to: number | null;
    };
};

const perks: TranslationKey[] = [
    'listing.hero.perk1',
    'listing.hero.perk2',
    'listing.hero.perk3',
];

const steps: {
    title: TranslationKey;
    text: TranslationKey;
    status: ArticleStatus;
}[] = [
    {
        title: 'listing.steps.write',
        text: 'listing.steps.write_text',
        status: 'draft',
    },
    {
        title: 'listing.steps.review',
        text: 'listing.steps.review_text',
        status: 'review',
    },
    {
        title: 'listing.steps.publish',
        text: 'listing.steps.publish_text',
        status: 'published',
    },
];

function pageUrl(category: string | null, page: number): string {
    const query: Record<string, string | number> = {};

    if (category) {
        query.categoria = category;
    }

    if (page > 1) {
        query.page = page;
    }

    return `${index({ query }).url}#artigos`;
}

/**
 * Listagem pública em `/artigos` (prancha "Home", RF-002, RF-133): a
 * abertura, os artigos visíveis por categoria, do mais novo para o mais
 * antigo, e como publicar. Ordenar e filtrar entram com a busca (fatia 13).
 */
export default function ArticlesIndex({
    categories,
    category,
    articles,
}: Props) {
    const { t } = useTranslation();
    const active = categories.find((item) => item.slug === category) ?? null;

    return (
        <>
            <Head title={active ? active.name : t('listing.title')} />
            <Hero />

            <section
                id="artigos"
                aria-labelledby="artigos-title"
                className="mx-auto mt-18 flex w-full max-w-page scroll-mt-6 flex-col gap-6 px-4 sm:px-8"
            >
                <h2
                    id="artigos-title"
                    className="font-display text-[2rem]/10 font-extrabold tracking-[-0.02em]"
                >
                    {active
                        ? t('listing.in_category', { category: active.name })
                        : t('listing.title')}
                </h2>

                {categories.length > 0 && (
                    <nav
                        id="categorias"
                        aria-label={t('listing.categories')}
                        className="flex scroll-mt-24 flex-wrap gap-2"
                    >
                        <CategoryChip
                            href={pageUrl(null, 1)}
                            current={category === null}
                        >
                            <LayoutGrid aria-hidden="true" className="size-4" />
                            {t('listing.all')}
                        </CategoryChip>
                        {categories.map((item) => (
                            <CategoryChip
                                key={item.slug}
                                href={pageUrl(item.slug, 1)}
                                current={item.slug === category}
                            >
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'size-2.5 rounded-full ring-1 ring-text-primary/15 ring-inset',
                                        pastelTones[item.color],
                                    )}
                                />
                                {item.name}
                            </CategoryChip>
                        ))}
                    </nav>
                )}

                {articles.total === 0 ? (
                    <Empty category={active} />
                ) : (
                    <>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
                            {articles.data.map((article) => (
                                <ArticleCard
                                    key={article.url}
                                    article={article}
                                />
                            ))}
                        </div>
                        <p
                            role="status"
                            className="-mb-2 text-center text-meta text-text-secondary"
                        >
                            {articles.total === 1
                                ? t('listing.showing_one')
                                : t('listing.showing', {
                                      first: articles.from ?? 0,
                                      last: articles.to ?? 0,
                                      count: articles.total,
                                  })}
                        </p>
                        <Pagination
                            current={articles.currentPage}
                            last={articles.lastPage}
                            href={(page) => pageUrl(category, page)}
                        />
                    </>
                )}
            </section>

            <Steps />
        </>
    );
}

/** Abertura da prancha "Home": o que é, a chamada e o mascote em órbita. */
function Hero() {
    const { t } = useTranslation();
    const writeHref = useWriteHref();

    return (
        <section
            aria-labelledby="listing-hero-title"
            className="mx-auto mt-8 w-full max-w-page px-4 sm:px-8"
        >
            <div className="relative flex flex-wrap items-center gap-8 overflow-hidden rounded-section bg-surface-muted px-[clamp(24px,5vw,64px)] py-[clamp(32px,4vw,48px)]">
                <div aria-hidden="true" className="dot-grid absolute inset-0" />
                <div className="relative flex min-w-0 flex-[999_1_520px] flex-col gap-5">
                    <Link
                        href={home()}
                        className="inline-flex h-9 items-center gap-2.5 self-start rounded-full bg-surface pr-3.5 pl-2.5 ring-1 ring-pastel-lavender ring-inset dark:ring-border"
                    >
                        <Sparkles
                            aria-hidden="true"
                            className="size-[18px] text-primary-text"
                        />
                        <span className="shiny-text text-meta font-extrabold">
                            {t('listing.hero.badge')}
                        </span>
                        <ChevronRight
                            aria-hidden="true"
                            className="size-[15px] text-primary-text"
                        />
                    </Link>
                    <h1
                        id="listing-hero-title"
                        className="max-w-160 font-display text-[clamp(2.25rem,4.5vw,3rem)] leading-[1.17] font-extrabold tracking-[-0.03em]"
                    >
                        {t('listing.hero.title_before')}{' '}
                        <span className="highlight-mark">
                            {t('listing.hero.title_mark')}
                        </span>{' '}
                        {t('listing.hero.title_after')}
                    </h1>
                    <p className="max-w-140 text-[1.125rem]/7 text-text-secondary">
                        {t('listing.hero.lead')}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3">
                        <Button
                            asChild
                            size="xl"
                            className="shimmer shadow-primary"
                        >
                            <a href="#artigos">
                                {t('listing.hero.explore')}
                                <ArrowDown
                                    aria-hidden="true"
                                    className="size-[18px]"
                                />
                            </a>
                        </Button>
                        <Button
                            asChild
                            size="xl"
                            variant="secondary"
                            className="border border-pastel-lavender dark:border-border"
                        >
                            <Link href={writeHref}>
                                <PenLine
                                    aria-hidden="true"
                                    className="size-[18px]"
                                />
                                {t('listing.hero.write')}
                            </Link>
                        </Button>
                    </div>
                    <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                        {perks.map((perk) => (
                            <li
                                key={perk}
                                className="inline-flex items-center gap-1.5 text-meta font-semibold text-text-secondary"
                            >
                                <CircleCheck
                                    aria-hidden="true"
                                    className="size-4 text-success-fg"
                                />
                                {t(perk)}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative flex flex-[1_1_300px] justify-center">
                    <MascotOrbit>
                        <Mascot
                            art="apresentando"
                            size={210}
                            float
                            grounded
                            className="max-w-[42vw]"
                        />
                    </MascotOrbit>
                </div>
            </div>
        </section>
    );
}

function CategoryChip({
    href,
    current,
    children,
}: {
    href: string;
    current: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            preserveScroll
            aria-current={current ? 'true' : undefined}
            className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-meta',
                current
                    ? 'bg-surface-selected font-bold text-text-on-selected ring-2 ring-primary ring-inset'
                    : 'bg-surface font-semibold ring-1 ring-border ring-inset hover:bg-surface-hover',
            )}
        >
            {children}
        </Link>
    );
}

/** Nada para ler ainda, no site todo ou na categoria escolhida. */
function Empty({ category }: { category: Category | null }) {
    const { t } = useTranslation();
    const writeHref = useWriteHref();

    if (category) {
        return (
            <EmptyState
                Icon={LayoutGrid}
                title={t('listing.empty_category.title', {
                    category: category.name,
                })}
                text={t('listing.empty_category.text')}
                action={
                    <Button asChild variant="outline" size="md">
                        <Link href={pageUrl(null, 1)}>
                            {t('listing.empty_category.all')}
                        </Link>
                    </Button>
                }
            />
        );
    }

    return (
        <div className="mx-auto flex max-w-180 flex-wrap items-center justify-center gap-x-8 gap-y-5 rounded-card border border-dashed border-pastel-lavender bg-surface-muted p-[clamp(24px,4vw,40px)] text-center sm:text-left dark:border-border">
            <Mascot art="escrevendo" size={140} float grounded />
            <div className="flex min-w-0 flex-[1_1_280px] flex-col items-center gap-3 sm:items-start">
                <h3 className="text-h3 font-extrabold">
                    {t('landing.community.empty.title')}
                </h3>
                <p className="text-body text-text-secondary">
                    {t('landing.community.empty.text')}
                </p>
                <Button asChild size="md" className="mt-1 shadow-primary">
                    <Link href={writeHref}>
                        <PenLine aria-hidden="true" className="size-[18px]" />
                        {t('landing.cta.write')}
                    </Link>
                </Button>
            </div>
        </div>
    );
}

/** "Publicar aqui leva três passos", com os estados que o autor vai ver. */
function Steps() {
    const { t } = useTranslation();
    const writeHref = useWriteHref();

    return (
        <section
            aria-labelledby="publicar-title"
            className="mx-auto my-24 w-full max-w-page px-4 sm:px-8"
        >
            <div className="flex flex-wrap items-center gap-10 rounded-section border border-border bg-surface p-[clamp(24px,4vw,48px)]">
                <div className="flex flex-none justify-center max-sm:w-full">
                    <Mascot art="escrevendo" size={220} float grounded />
                </div>
                <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
                    <h2
                        id="publicar-title"
                        className="font-display text-[2rem]/10 font-extrabold tracking-[-0.02em]"
                    >
                        {t('listing.steps.title')}
                    </h2>
                    <ol className="flex flex-wrap gap-4">
                        {steps.map((item, number) => (
                            <li
                                key={item.title}
                                className="lift-card flex flex-[1_1_220px] flex-col gap-2.5 rounded-2xl border border-border bg-surface p-5"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        aria-hidden="true"
                                        className="inline-flex size-7 items-center justify-center rounded-lg bg-surface-selected font-display text-meta font-extrabold text-text-on-selected"
                                    >
                                        {number + 1}
                                    </span>
                                    <strong className="font-display text-[1.125rem]">
                                        {t(item.title)}
                                    </strong>
                                </div>
                                <StatusBadge status={item.status} />
                                <p className="text-label leading-[1.4375rem] text-text-secondary">
                                    {t(item.text)}
                                </p>
                            </li>
                        ))}
                    </ol>
                    <div>
                        <Button asChild size="xl" className="shadow-primary">
                            <Link href={writeHref}>
                                <PenLine
                                    aria-hidden="true"
                                    className="size-[18px]"
                                />
                                {t('landing.cta.write')}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
