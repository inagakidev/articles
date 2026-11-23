import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Eye } from 'lucide-react';
import ArticleBody from '@/components/articles/article-body';
import ArticleToc from '@/components/articles/article-toc';
import type { TocItem } from '@/components/articles/article-toc';
import { Button } from '@/components/ui/button';
import Pill from '@/components/ui/pill';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { edit } from '@/routes/articles';
import { show as profile } from '@/routes/profiles';
import type { PastelTone } from '@/types';

type Props = {
    articleId: number;
    article: {
        title: string | null;
        language: string | null;
        category: { name: string; color: PastelTone } | null;
        tags: string[];
        cover: {
            src: string;
            srcset: string;
            width: number;
            height: number;
            alt: string;
        } | null;
        html: string;
        toc: TocItem[];
        readingMinutes: number;
        author: {
            name: string;
            username: string;
            bio: string | null;
            avatar: string | null;
        };
    };
};

/**
 * Prévia (prancha "Prévia", RF-072): a mesma renderização da página
 * pública (p4-06). Nada é publicado daqui; o envio entra na fatia 10.
 */
export default function Preview({ articleId, article }: Props) {
    const { t } = useTranslation();
    const { author } = article;

    return (
        <>
            <Head
                title={`${t('preview.title')}: ${article.title || t('preview.untitled')}`}
            />

            <div className="sticky top-0 z-30 border-b border-pastel-lavender bg-surface-muted/95 backdrop-blur-md dark:border-border">
                <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
                    <span className="inline-flex items-center gap-2 font-display font-extrabold">
                        <Eye
                            aria-hidden="true"
                            className="size-5 text-primary-text"
                        />
                        {t('preview.title')}
                    </span>
                    <span className="text-meta text-text-secondary">
                        {t('preview.banner')}
                    </span>
                    <Button asChild size="sm" className="ml-auto">
                        <Link href={edit(articleId)}>
                            <ArrowLeft aria-hidden="true" />
                            {t('preview.back')}
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mx-auto flex max-w-page gap-12 px-4 pt-10 pb-24 sm:px-6">
                <article
                    lang={article.language?.replace('_', '-') ?? undefined}
                    className="mx-auto w-full max-w-reading min-w-0"
                >
                    <header className="mb-8 flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3 text-meta text-text-secondary">
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
                        <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] leading-[1.15] font-extrabold tracking-[-0.02em] break-words">
                            {article.title || t('preview.untitled')}
                        </h1>
                        <div className="flex items-center gap-3">
                            <UserAvatar
                                name={author.name}
                                avatar={author.avatar}
                                className="size-11 text-meta"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold">{author.name}</span>
                                <span className="text-caption text-text-secondary">
                                    {t('preview.not_published')}
                                </span>
                            </div>
                        </div>
                    </header>

                    {article.cover && (
                        <img
                            src={article.cover.src}
                            srcSet={article.cover.srcset || undefined}
                            sizes="(min-width: 768px) 720px, 100vw"
                            width={article.cover.width}
                            height={article.cover.height}
                            alt={article.cover.alt}
                            className="mb-10 aspect-video w-full rounded-card bg-surface-muted object-cover"
                        />
                    )}

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
                                <li
                                    key={tag}
                                    className="rounded-full bg-surface-muted px-3 py-1 font-mono text-caption font-bold"
                                >
                                    #{tag}
                                </li>
                            ))}
                        </ul>
                    )}

                    <section
                        aria-labelledby="author-title"
                        className="mt-10 flex flex-wrap items-center gap-5 rounded-card border border-border bg-surface p-6"
                    >
                        <UserAvatar
                            name={author.name}
                            avatar={author.avatar}
                            className="size-16 text-h3"
                        />
                        <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
                            <span className="text-caption font-bold text-text-secondary">
                                {t('preview.written_by')}
                            </span>
                            <h2
                                id="author-title"
                                className="font-display text-h3 font-extrabold"
                            >
                                {author.name}
                            </h2>
                            {author.bio && (
                                <p className="text-meta text-text-secondary">
                                    {author.bio}
                                </p>
                            )}
                            <Link
                                href={profile({ username: author.username })}
                                className="text-meta font-bold text-primary-text hover:underline"
                            >
                                {t('preview.view_profile')}
                            </Link>
                        </div>
                    </section>
                </article>

                <aside className="hidden w-64 shrink-0 xl:block">
                    <div className="sticky top-24">
                        <ArticleToc items={article.toc} />
                    </div>
                </aside>
            </div>
        </>
    );
}
