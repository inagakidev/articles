import { Link } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import ArticleBody from '@/components/articles/article-body';
import ArticleToc from '@/components/articles/article-toc';
import Pill from '@/components/ui/pill';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { search } from '@/routes';
import { show as profile } from '@/routes/profiles';
import type { ReadableArticle } from '@/types';

/**
 * O artigo como se lê (pranchas "Leitura" e "Prévia"): cabeçalho na largura
 * do texto, capa na largura da página e, abaixo, o texto com o sumário ao
 * lado. A prévia e a página pública usam este mesmo componente (p4-06).
 */
export default function ArticleView({
    article,
    byline,
    actions,
    after,
}: {
    article: ReadableArticle;
    /** Abaixo do nome de quem escreveu: as datas, ou "ainda não publicado". */
    byline: ReactNode;
    /** Ações sobre o artigo (compartilhar), abaixo das tags e ao lado do sumário. */
    actions?: ReactNode;
    /** Depois do cartão de autoria (o fim da leitura). */
    after?: ReactNode;
}) {
    const { t } = useTranslation();
    const { author } = article;
    const authorHref = author.username
        ? profile({ username: author.username })
        : null;

    return (
        <article
            lang={article.language?.replace('_', '-') ?? undefined}
            className="mx-auto w-full max-w-page px-4 pt-10 pb-24 sm:px-8 sm:pt-14"
        >
            <header className="mb-8 flex max-w-reading flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2.5 text-meta font-semibold text-text-secondary">
                    {article.category && (
                        <Pill tone={article.category.color}>
                            {article.category.name}
                        </Pill>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden="true" className="size-4" />
                        {t('article.reading_time', {
                            minutes: article.readingMinutes,
                        })}
                    </span>
                </div>
                <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-[1.18] font-extrabold tracking-[-0.025em] break-words">
                    {article.title || t('preview.untitled')}
                </h1>
                <div className="flex items-center gap-3">
                    <UserAvatar
                        name={author.name}
                        avatar={author.avatar}
                        className="size-11 text-meta"
                    />
                    <div className="flex min-w-0 flex-col">
                        {authorHref ? (
                            <Link
                                href={authorHref}
                                className="font-bold hover:underline"
                            >
                                {author.name}
                            </Link>
                        ) : (
                            <span className="font-bold">{author.name}</span>
                        )}
                        <span className="text-caption text-text-secondary">
                            {byline}
                        </span>
                    </div>
                </div>
            </header>

            {article.cover && (
                <img
                    src={article.cover.src}
                    srcSet={article.cover.srcset || undefined}
                    sizes="(min-width: 1152px) 1104px, 100vw"
                    width={article.cover.width}
                    height={article.cover.height}
                    alt={article.cover.alt}
                    className="mb-12 aspect-video w-full rounded-card bg-surface-muted object-cover"
                />
            )}

            <div className="flex gap-6 xl:gap-4">
                {actions && (
                    <aside
                        aria-label={t('article.actions')}
                        className="hidden w-14 shrink-0 xl:block"
                    >
                        <div className="sticky top-24 flex flex-col items-center gap-0.5 rounded-2xl border border-border bg-surface p-1.5 shadow-sm">
                            {actions}
                        </div>
                    </aside>
                )}
                <div className="w-full max-w-reading min-w-0">
                    {article.html ? (
                        <ArticleBody
                            html={article.html}
                            lang={article.language}
                        />
                    ) : (
                        <p className="text-text-secondary">
                            {t('preview.empty')}
                        </p>
                    )}

                    {article.tags.length > 0 && (
                        <ul
                            aria-label={t('article.tags')}
                            className="mt-10 flex flex-wrap gap-2"
                        >
                            {article.tags.map((tag) => (
                                <li key={tag}>
                                    <Link
                                        href={search({
                                            query: { tags: [tag] },
                                        })}
                                        className="block rounded-full bg-surface-muted px-3 py-1 font-mono text-caption font-bold hover:bg-surface-selected hover:text-text-on-selected"
                                    >
                                        #{tag}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    {actions && (
                        <div className="mt-8 flex flex-wrap items-center gap-1 border-y border-border px-1.5 py-1 xl:hidden">
                            {actions}
                        </div>
                    )}

                    <section
                        aria-labelledby="author-title"
                        className="mt-8 flex flex-wrap items-start gap-4 rounded-card border border-border bg-surface p-6"
                    >
                        <UserAvatar
                            name={author.name}
                            avatar={author.avatar}
                            className="size-16 text-h3"
                        />
                        <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1.5">
                            <span className="text-caption font-bold tracking-[0.06em] text-text-secondary uppercase">
                                {t('preview.written_by')}
                            </span>
                            <h2
                                id="author-title"
                                className="font-display text-h3 font-extrabold"
                            >
                                {author.name}
                            </h2>
                            {author.bio && (
                                <p className="text-label leading-6 text-text-secondary">
                                    {author.bio}
                                </p>
                            )}
                            {authorHref && (
                                <Link
                                    href={authorHref}
                                    className="text-meta font-bold text-primary-text hover:underline"
                                >
                                    {t('preview.view_profile')}
                                </Link>
                            )}
                        </div>
                    </section>

                    {after}
                </div>

                <aside className="hidden w-60 shrink-0 xl:block">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <ArticleToc items={article.toc} />
                    </div>
                </aside>
            </div>
        </article>
    );
}
