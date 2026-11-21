import { Link } from '@inertiajs/react';
import AuthorAvatar from '@/components/articles/author-avatar';
import Pill, { pastelTones } from '@/components/ui/pill';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { followPointer } from '@/lib/spotlight';
import { cn } from '@/lib/utils';
import type { ArticleSummary } from '@/types';

/**
 * Cartão de artigo publicado: capa, categoria, título, resumo e autoria.
 * O cartão inteiro é clicável pelo link do título.
 */
export default function ArticleCard({
    article,
    className,
}: {
    article: ArticleSummary;
    className?: string;
}) {
    const { t, locale } = useTranslation();
    const { category, author } = article;

    return (
        <article
            onPointerMove={followPointer}
            className={cn(
                'lift-card spotlight relative flex flex-col gap-4 rounded-card border border-border bg-surface p-3 shadow-sm',
                className,
            )}
        >
            <div
                className={cn(
                    'aspect-video w-full overflow-hidden rounded-inner',
                    pastelTones[category?.color ?? 'lilac'],
                )}
            >
                {article.cover && (
                    <img
                        src={article.cover}
                        alt=""
                        className="size-full object-cover"
                    />
                )}
            </div>
            <div className="flex flex-1 flex-col gap-3 px-2 pb-2">
                {category && (
                    <div>
                        <Pill tone={category.color}>{category.name}</Pill>
                    </div>
                )}
                <h3 className="text-card-title font-bold">
                    <Link href={article.url} className="stretched-link">
                        {article.title}
                    </Link>
                </h3>
                <p className="line-clamp-3 text-label leading-6 text-text-secondary">
                    {article.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2.5 pt-1">
                    <AuthorAvatar
                        author={author}
                        className="size-8 rounded-full text-badge"
                    />
                    <div className="flex min-w-0 flex-col">
                        <span className="text-meta font-bold">
                            {author.name}
                        </span>
                        <span className="text-caption text-text-secondary">
                            {formatDate(locale, article.publishedAt, 'medium')}{' '}
                            ·{' '}
                            {t('article.reading_time', {
                                minutes: article.readingMinutes,
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </article>
    );
}
