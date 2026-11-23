import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Clock, Eye, Send } from 'lucide-react';
import ArticleBody from '@/components/articles/article-body';
import ArticleToc from '@/components/articles/article-toc';
import type { TocItem } from '@/components/articles/article-toc';
import { Button } from '@/components/ui/button';
import Pill from '@/components/ui/pill';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { edit } from '@/routes/articles';
import * as submission from '@/routes/articles/submission';
import { show as profile } from '@/routes/profiles';
import type { PastelTone } from '@/types';

type Props = {
    articleId: number;
    /** O que está na tela é o rascunho, e nada espera na fila (RF-102). */
    canSubmit: boolean;
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
export default function Preview({ articleId, canSubmit, article }: Props) {
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);

    function submit() {
        setSubmitting(true);
        router.post(
            submission.store(articleId).url,
            {},
            {
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ?? t('editor.submit.failed'),
                    ),
                onFinish: () => setSubmitting(false),
            },
        );
    }

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
                    <div className="ml-auto flex flex-wrap gap-2">
                        <Button
                            asChild
                            size="sm"
                            variant={canSubmit ? 'outline' : 'default'}
                        >
                            <Link href={edit(articleId)}>
                                <ArrowLeft aria-hidden="true" />
                                {t('preview.back')}
                            </Link>
                        </Button>
                        {canSubmit && (
                            <Button
                                type="button"
                                size="sm"
                                disabled={submitting}
                                onClick={submit}
                            >
                                <Send aria-hidden="true" />
                                {submitting
                                    ? t('editor.submit.sending')
                                    : t('editor.submit.action')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Como na prancha "Prévia": cabeçalho na largura do texto, capa
                na largura da página e, abaixo, o texto com o sumário ao lado. */}
            <article
                lang={article.language?.replace('_', '-') ?? undefined}
                className="mx-auto max-w-page px-4 pt-10 pb-24 sm:px-6"
            >
                <header className="mb-8 flex max-w-reading flex-col gap-4">
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
                        sizes="(min-width: 1152px) 1104px, 100vw"
                        width={article.cover.width}
                        height={article.cover.height}
                        alt={article.cover.alt}
                        className="mb-12 aspect-video w-full rounded-card bg-surface-muted object-cover"
                    />
                )}

                <div className="flex gap-16">
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
                                    href={profile({
                                        username: author.username,
                                    })}
                                    className="text-meta font-bold text-primary-text hover:underline"
                                >
                                    {t('preview.view_profile')}
                                </Link>
                            </div>
                        </section>
                    </div>

                    <aside className="hidden w-64 shrink-0 xl:block">
                        <div className="sticky top-24">
                            <ArticleToc items={article.toc} />
                        </div>
                    </aside>
                </div>
            </article>
        </>
    );
}
