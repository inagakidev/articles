import { Link } from '@inertiajs/react';
import { PenLine } from 'lucide-react';
import ArticleCard from '@/components/articles/article-card';
import AuthorAvatar from '@/components/articles/author-avatar';
import SectionHeading, {
    LandingContainer,
} from '@/components/blocks/section-heading';
import { Button } from '@/components/ui/button';
import Marquee from '@/components/ui/marquee';
import Mascot from '@/components/ui/mascot';
import { useTranslation } from '@/lib/i18n';
import { register } from '@/routes';
import type { ArticleSummary, AuthorSummary } from '@/types';

/** Abaixo disso a faixa rolante repetiria os mesmos cartões lado a lado. */
const MARQUEE_MIN = 4;

/** Quantos rostos aparecem antes do "+N". */
const FACES = 5;

export type CommunityAuthors = {
    /** Quem publicou neste mês. */
    count: number;
    people: AuthorSummary[];
};

/**
 * Artigos publicados recentes e quem escreveu (RF-380 a RF-382). Sem
 * artigos ainda, um convite para ser das primeiras pessoas a publicar.
 */
export default function Community({
    articles,
    authors,
}: {
    articles: ArticleSummary[];
    authors: CommunityAuthors;
}) {
    const { t } = useTranslation();
    const rows =
        articles.length >= MARQUEE_MIN * 2
            ? [
                  articles.slice(0, Math.ceil(articles.length / 2)),
                  articles.slice(Math.ceil(articles.length / 2)),
              ]
            : [articles];

    return (
        <section
            aria-labelledby="comunidade-title"
            className="overflow-hidden py-[clamp(72px,10vw,128px)]"
        >
            <LandingContainer>
                <SectionHeading
                    id="comunidade-title"
                    eyebrow={t('landing.community.eyebrow')}
                    title={t('landing.community.title')}
                    lead={t('landing.community.lead')}
                />
                {authors.count > 0 && <Authors authors={authors} />}
            </LandingContainer>

            {articles.length === 0 ? (
                <LandingContainer className="mt-12">
                    <Invitation />
                </LandingContainer>
            ) : articles.length < MARQUEE_MIN ? (
                <LandingContainer className="mt-12 flex flex-wrap justify-center gap-5">
                    {articles.map((article) => (
                        <ArticleCard
                            key={article.url}
                            article={article}
                            className="w-[min(330px,100%)]"
                        />
                    ))}
                </LandingContainer>
            ) : (
                <div className="mt-12 flex flex-col gap-5">
                    {rows.map((row, index) => (
                        <Marquee key={index} reverse={index === 1}>
                            {row.map((article) => (
                                <ArticleCard
                                    key={article.url}
                                    article={article}
                                    className="w-82.5 shrink-0"
                                />
                            ))}
                        </Marquee>
                    ))}
                </div>
            )}
        </section>
    );
}

function Authors({ authors }: { authors: CommunityAuthors }) {
    const { t } = useTranslation();
    const faces = authors.people.slice(0, FACES);
    const more = authors.count - faces.length;

    return (
        <div className="mt-7 flex flex-col items-center gap-2.5">
            <div aria-hidden="true" className="flex">
                {faces.map((author, index) => (
                    <AuthorAvatar
                        key={author.name}
                        author={author}
                        index={index}
                        className="-ml-3 size-12 rounded-full text-label ring-3 ring-surface-muted first:ml-0"
                    />
                ))}
                {more > 0 && (
                    <span className="-ml-3 inline-flex size-12 items-center justify-center rounded-full bg-pastel-lavender text-label font-extrabold text-pastel-lavender-fg ring-3 ring-surface-muted">
                        +{more}
                    </span>
                )}
            </div>
            <span className="text-meta font-bold text-text-secondary">
                {authors.count === 1
                    ? t('landing.community.authors_one')
                    : t('landing.community.authors', { count: authors.count })}
            </span>
        </div>
    );
}

function Invitation() {
    const { t } = useTranslation();

    return (
        <div className="reveal mx-auto flex max-w-180 flex-wrap items-center justify-center gap-x-8 gap-y-5 rounded-[28px] border border-dashed border-pastel-lavender bg-surface-muted p-[clamp(24px,4vw,40px)] text-center sm:text-left dark:border-border">
            <Mascot art="escrevendo" size={140} float grounded />
            <div className="flex min-w-0 flex-[1_1_280px] flex-col items-center gap-3 sm:items-start">
                <h3 className="text-h3 font-extrabold">
                    {t('landing.community.empty.title')}
                </h3>
                <p className="text-body text-text-secondary">
                    {t('landing.community.empty.text')}
                </p>
                <Button
                    asChild
                    size="md"
                    className="mt-1 rounded-[14px] shadow-primary"
                >
                    <Link href={register()}>
                        <PenLine aria-hidden="true" className="size-[18px]" />
                        {t('landing.cta.write')}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
