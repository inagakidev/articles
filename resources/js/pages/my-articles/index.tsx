import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, PenLine, PencilLine, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import ArticleRow from '@/components/my-articles/article-row';
import SubmittedBanner from '@/components/my-articles/submitted-banner';
import type { MyArticle, MySections } from '@/components/my-articles/types';
import WithdrawDialog from '@/components/my-articles/withdraw-dialog';
import type { KeepChoice } from '@/components/my-articles/withdraw-dialog';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import { isToday, relative, shortDate, time } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { create, edit, preview } from '@/routes/articles';
import { trash as trashPage } from '@/routes/articles';
import * as submission from '@/routes/articles/submission';
import * as trashRoutes from '@/routes/articles/trash';

type Props = {
    sections: MySections;
    trashCount: number;
    reviewHours: number;
};

const SECTIONS: {
    key: keyof MySections;
    anchor: string;
    title: TranslationKey;
    hint?: TranslationKey;
}[] = [
    {
        key: 'drafts',
        anchor: 'rascunhos',
        title: 'my_articles.sections.drafts',
        hint: 'my_articles.sections.drafts_hint',
    },
    { key: 'review', anchor: 'revisao', title: 'my_articles.sections.review' },
    {
        key: 'rejected',
        anchor: 'nao-aprovados',
        title: 'my_articles.sections.rejected',
    },
    {
        key: 'published',
        anchor: 'publicados',
        title: 'my_articles.sections.published',
    },
];

/**
 * Meus artigos (prancha "Meus artigos", RF-112 a RF-115): cada artigo em
 * uma única seção, com a ação principal do estado dele. Retirar da fila e
 * mandar para a lixeira não pedem confirmação: o aviso traz "Desfazer".
 */
export default function MyArticles({
    sections,
    trashCount,
    reviewHours,
}: Props) {
    const { t, locale } = useTranslation();
    const { flash } = usePage();
    const [submitted, setSubmitted] = useState(flash.submitted ?? null);
    const [choosing, setChoosing] = useState<MyArticle | null>(null);
    const [processing, setProcessing] = useState(false);
    const all = Object.values(sections).flat();
    const name = (article: { title: string | null }) =>
        article.title || t('my_articles.untitled');

    function focusRow(id: number) {
        requestAnimationFrame(() =>
            document.getElementById(`article-${id}`)?.focus(),
        );
    }

    function withdraw(article: MyArticle, keep?: KeepChoice) {
        if (article.hasDraft && keep === undefined) {
            setChoosing(article);

            return;
        }

        setProcessing(true);
        router.delete(submission.destroy(article.id).url, {
            data: keep ? { keep } : {},
            preserveScroll: true,
            onSuccess: () => {
                setChoosing(null);
                setSubmitted((current) =>
                    current?.articleId === article.id ? null : current,
                );
                toast.success(t('my_articles.withdraw.done'), {
                    duration: 10000,
                    action:
                        keep === undefined
                            ? {
                                  label: t('my_articles.undo'),
                                  onClick: () =>
                                      router.post(
                                          submission.store(article.id).url,
                                      ),
                              }
                            : undefined,
                });
                focusRow(article.id);
            },
            onFinish: () => setProcessing(false),
        });
    }

    function trash(article: MyArticle) {
        router.post(
            trashRoutes.store(article.id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        t('my_articles.trashed', { title: name(article) }),
                        {
                            duration: 10000,
                            action: {
                                label: t('my_articles.undo'),
                                onClick: () =>
                                    router.delete(
                                        trashRoutes.destroy(article.id).url,
                                        { preserveScroll: true },
                                    ),
                            },
                        },
                    ),
            },
        );
    }

    const words = (article: MyArticle) =>
        article.words === 0
            ? t('my_articles.meta.empty')
            : t('my_articles.meta.words', {
                  count: article.words.toLocaleString(locale.replace('_', '-')),
              });

    const sentAt = (iso: string) =>
        isToday(iso)
            ? t('my_articles.meta.sent_today', { time: time(iso, locale) })
            : t('my_articles.meta.sent_on', {
                  date: shortDate(iso, locale),
                  time: time(iso, locale),
              });

    function row(section: keyof MySections, article: MyArticle) {
        const withdrawButton = (label: TranslationKey) => (
            <Button
                type="button"
                variant="outline"
                size="md"
                disabled={processing}
                aria-label={t(`${label}_named` as TranslationKey, {
                    title: name(article),
                })}
                onClick={() => withdraw(article)}
            >
                {t(label)}
            </Button>
        );

        switch (section) {
            case 'drafts':
                return (
                    <ArticleRow
                        key={article.id}
                        id={article.id}
                        title={article.title}
                        onTrash={() => trash(article)}
                        badge={
                            article.pendingSubmittedAt && (
                                <Badge tone="warning">
                                    {t('my_articles.badges.in_queue')}
                                </Badge>
                            )
                        }
                        meta={`${t('my_articles.meta.edited', {
                            when: relative(article.updatedAt ?? '', locale),
                        })} · ${words(article)}`}
                        actions={
                            <>
                                {article.pendingSubmittedAt &&
                                    withdrawButton(
                                        'my_articles.withdraw.action',
                                    )}
                                <Button asChild variant="secondary" size="md">
                                    <Link
                                        href={edit(article.id)}
                                        aria-label={t(
                                            'my_articles.continue_named',
                                            {
                                                title: name(article),
                                            },
                                        )}
                                    >
                                        <PencilLine aria-hidden="true" />
                                        {t('my_articles.continue')}
                                    </Link>
                                </Button>
                            </>
                        }
                    />
                );
            case 'review':
                return (
                    <ArticleRow
                        key={article.id}
                        id={article.id}
                        title={article.title}
                        onTrash={() => trash(article)}
                        meta={`${sentAt(article.submittedAt ?? '')} ${t(
                            'my_articles.meta.review_estimate',
                            { hours: reviewHours },
                        )}`}
                        actions={
                            <>
                                {withdrawButton('my_articles.withdraw.action')}
                                <Button asChild variant="subtle" size="md">
                                    <Link
                                        href={preview(article.id, {
                                            query: {
                                                version: article.versionId,
                                            },
                                        })}
                                        aria-label={t(
                                            'my_articles.view_sent_named',
                                            {
                                                title: name(article),
                                            },
                                        )}
                                    >
                                        {t('my_articles.view_sent')}
                                    </Link>
                                </Button>
                            </>
                        }
                    />
                );
            case 'rejected':
                return (
                    <ArticleRow
                        key={article.id}
                        id={article.id}
                        title={article.title}
                        onTrash={() => trash(article)}
                        meta={[
                            article.submittedAt &&
                                t('my_articles.meta.sent_short', {
                                    date: shortDate(
                                        article.submittedAt,
                                        locale,
                                    ),
                                }),
                            article.decidedAt &&
                                t('my_articles.meta.reviewed', {
                                    date: shortDate(article.decidedAt, locale),
                                }),
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                        actions={
                            <Button asChild size="md">
                                <Link href={edit(article.id)}>
                                    <PenLine aria-hidden="true" />
                                    {t('my_articles.fix')}
                                </Link>
                            </Button>
                        }
                    >
                        <div className="flex items-start gap-4 rounded-[14px] bg-surface-muted px-4.5 py-4">
                            <Mascot
                                art="pensativo"
                                size={72}
                                className="hidden shrink-0 sm:block"
                            />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                {article.decidedAt && (
                                    <span className="text-caption font-bold text-text-secondary">
                                        {t('my_articles.review_of', {
                                            date: shortDate(
                                                article.decidedAt,
                                                locale,
                                            ),
                                        })}
                                    </span>
                                )}
                                {article.reason && (
                                    <p className="text-[0.9375rem] leading-6">
                                        “{article.reason}”
                                    </p>
                                )}
                                <p className="text-meta text-text-secondary">
                                    <strong className="text-text-primary">
                                        {t('my_articles.next_step')}
                                    </strong>{' '}
                                    {t('my_articles.next_step_text')}
                                </p>
                            </div>
                        </div>
                    </ArticleRow>
                );
            case 'published':
                return (
                    <ArticleRow
                        key={article.id}
                        id={article.id}
                        title={article.title}
                        onTrash={() => trash(article)}
                        badge={
                            article.pendingSubmittedAt ? (
                                <Badge tone="warning">
                                    {t('my_articles.badges.edit_pending')}
                                </Badge>
                            ) : article.editRejected ? (
                                <Badge tone="danger">
                                    {t('my_articles.badges.edit_rejected')}
                                </Badge>
                            ) : undefined
                        }
                        meta={[
                            article.firstPublishedAt &&
                                t('my_articles.meta.live_since', {
                                    date: shortDate(
                                        article.firstPublishedAt,
                                        locale,
                                    ),
                                }),
                            article.currentSince &&
                                article.firstPublishedAt &&
                                shortDate(article.currentSince, locale) !==
                                    shortDate(
                                        article.firstPublishedAt,
                                        locale,
                                    ) &&
                                t('my_articles.meta.updated', {
                                    date: shortDate(
                                        article.currentSince,
                                        locale,
                                    ),
                                }),
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                        actions={
                            <>
                                {article.url && (
                                    <Button asChild variant="subtle" size="md">
                                        <Link
                                            href={article.url}
                                            aria-label={t(
                                                'my_articles.view_named',
                                                { title: name(article) },
                                            )}
                                        >
                                            <Eye aria-hidden="true" />
                                            {t('my_articles.view')}
                                        </Link>
                                    </Button>
                                )}
                                {article.pendingSubmittedAt ? (
                                    withdrawButton(
                                        'my_articles.withdraw.edit_action',
                                    )
                                ) : (
                                    <Button asChild variant="outline" size="md">
                                        <Link
                                            href={edit(article.id)}
                                            aria-label={t(
                                                'my_articles.edit_named',
                                                {
                                                    title: name(article),
                                                },
                                            )}
                                        >
                                            {t('my_articles.edit')}
                                        </Link>
                                    </Button>
                                )}
                            </>
                        }
                    />
                );
        }
    }

    return (
        <>
            <Head title={t('my_articles.title')} />

            <div className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 pt-10 pb-24 sm:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-[clamp(2rem,4vw,2.5rem)] leading-tight font-extrabold tracking-[-0.02em]">
                            {t('my_articles.title')}
                        </h1>
                        <p className="mt-1.5 text-text-secondary">
                            {t('my_articles.subtitle')}
                        </p>
                    </div>
                    <Button asChild size="xl">
                        <Link href={create()}>
                            <PenLine aria-hidden="true" />
                            {t('my_articles.new')}
                        </Link>
                    </Button>
                </div>

                {submitted && (
                    <SubmittedBanner
                        articleId={submitted.articleId}
                        title={submitted.title}
                        hours={reviewHours}
                        onWithdraw={() => {
                            const article = all.find(
                                (item) => item.id === submitted.articleId,
                            );

                            if (article) {
                                withdraw(article);
                            }
                        }}
                        onClose={() => setSubmitted(null)}
                    />
                )}

                {all.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface px-6 py-12 text-center">
                        <Mascot art="escrevendo" size={140} float grounded />
                        <strong className="font-display text-h3 font-extrabold">
                            {t('my_articles.empty.title')}
                        </strong>
                        <span className="max-w-110 text-text-secondary">
                            {t('my_articles.empty.text')}
                        </span>
                        <Button asChild size="md" className="mt-2">
                            <Link href={create()}>
                                <PenLine aria-hidden="true" />
                                {t('my_articles.empty.action')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <nav
                        aria-label={t('my_articles.sections.label')}
                        className="flex flex-wrap items-center gap-2"
                    >
                        {SECTIONS.filter(
                            ({ key }) => sections[key].length > 0,
                        ).map(({ key, anchor, title }) => (
                            <a
                                key={key}
                                href={`#${anchor}`}
                                className="inline-flex h-10 items-center gap-2 rounded-full bg-surface px-3.5 text-meta font-bold text-text-primary shadow-[inset_0_0_0_1px_var(--color-border)] hover:bg-surface-hover"
                            >
                                {t(title)}
                                <span className="min-w-5.5 rounded-full bg-surface-muted px-1.5 text-center text-caption leading-5.5 text-text-on-selected">
                                    {sections[key].length}
                                </span>
                            </a>
                        ))}
                        <Link
                            href={trashPage()}
                            className="ml-auto inline-flex items-center gap-1.5 rounded-full text-meta font-bold text-primary-text hover:underline"
                        >
                            <Trash2 aria-hidden="true" className="size-4" />
                            {t('my_articles.trash_link', { count: trashCount })}
                        </Link>
                    </nav>
                )}

                {SECTIONS.filter(({ key }) => sections[key].length > 0).map(
                    ({ key, anchor, title, hint }) => (
                        <section
                            key={key}
                            id={anchor}
                            aria-labelledby={`${anchor}-title`}
                            className="flex scroll-mt-6 flex-col gap-3"
                        >
                            <div className="flex flex-wrap items-baseline gap-3">
                                <h2
                                    id={`${anchor}-title`}
                                    className="font-display text-[1.375rem] font-extrabold"
                                >
                                    {t(title)}{' '}
                                    <span className="font-bold text-text-secondary">
                                        ({sections[key].length})
                                    </span>
                                </h2>
                                {hint && (
                                    <span className="text-meta text-text-secondary">
                                        {t(hint)}
                                    </span>
                                )}
                            </div>
                            <ul className="flex flex-col gap-3">
                                {sections[key].map((article) =>
                                    row(key, article),
                                )}
                            </ul>
                        </section>
                    ),
                )}

                {all.length > 0 && (
                    <p className="text-meta text-text-secondary">
                        {t('my_articles.trash_note', { days: 7 })}
                    </p>
                )}
            </div>

            <WithdrawDialog
                open={choosing !== null}
                processing={processing}
                draftMeta={
                    choosing
                        ? `${t('my_articles.meta.edited', {
                              when: relative(choosing.updatedAt ?? '', locale),
                          })}`
                        : ''
                }
                pendingMeta={
                    choosing?.pendingSubmittedAt
                        ? sentAt(choosing.pendingSubmittedAt)
                        : ''
                }
                onConfirm={(keep) => choosing && withdraw(choosing, keep)}
                onCancel={() => setChoosing(null)}
            />
        </>
    );
}

function Badge({
    tone,
    children,
}: {
    tone: 'warning' | 'danger';
    children: string;
}) {
    return (
        <span
            className={
                tone === 'warning'
                    ? 'inline-flex w-fit items-center rounded-full bg-surface px-2.5 py-0.5 text-caption font-bold text-warning-fg shadow-[inset_0_0_0_1px_var(--color-warning-fg)]'
                    : 'inline-flex w-fit items-center rounded-full bg-surface px-2.5 py-0.5 text-caption font-bold text-danger-fg shadow-[inset_0_0_0_1px_var(--color-danger-fg)]'
            }
        >
            {children}
        </span>
    );
}
