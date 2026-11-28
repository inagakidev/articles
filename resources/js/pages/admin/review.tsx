import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CircleAlert,
    ExternalLink,
    Languages,
    Link2,
    Snowflake,
} from 'lucide-react';
import { useState } from 'react';
import ArticleBody from '@/components/articles/article-body';
import DecisionFields from '@/components/moderation/decision-fields';
import { waiting } from '@/components/moderation/waiting';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import { Button } from '@/components/ui/button';
import Pill from '@/components/ui/pill';
import { Spinner } from '@/components/ui/spinner';
import UserAvatar from '@/components/ui/user-avatar';
import { isToday, shortDate, time } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { queue, review } from '@/routes/admin';
import { decide } from '@/routes/admin/review';
import { useQueueKeys } from '@/hooks/use-queue-keys';
import type { ReadableArticle } from '@/types';

type Props = {
    version: {
        id: number;
        submittedAt: string | null;
        late: boolean;
        edit: boolean;
        /** A versão em vigor, quando é uma edição de artigo publicado. */
        liveUrl: string | null;
        words: number;
        images: number;
        imagesWithAlt: number;
        links: number;
    };
    article: ReadableArticle;
    policyItems: PolicyItem[];
    queue: { count: number; previous: number | null; next: number | null };
    lateHours: number;
};

/**
 * Revisar uma versão (pranchas "Revisar versão" e "Rejeitar"): o retrato
 * congelado, com a mesma renderização da leitura, o resumo e a decisão
 * (RF-101, RF-107, RF-109). A administradora não edita.
 */
export default function Review({
    version,
    article,
    policyItems,
    queue: position,
    lateHours,
}: Props) {
    const { t, locale } = useTranslation();
    const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
    const author = article.author;
    useQueueKeys(
        position.previous === null ? null : review(position.previous).url,
        position.next === null ? null : review(position.next).url,
    );

    const sent = version.submittedAt
        ? isToday(version.submittedAt)
            ? t('admin.queue.today_at', {
                  time: time(version.submittedAt, locale),
              })
            : `${shortDate(version.submittedAt, locale)}, ${time(version.submittedAt, locale)}`
        : '—';

    return (
        <>
            <Head title={t('admin.review.title')} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                    {t('admin.review.title')}
                </h1>
                <Link
                    href={queue()}
                    className="inline-flex items-center gap-1.5 text-meta font-bold text-primary-text hover:underline"
                >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    {t('admin.review.back', { count: position.count })}
                </Link>
            </div>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-pastel-blue px-4 py-3 text-meta text-pastel-blue-fg">
                        <span className="inline-flex items-center gap-1.5 font-bold">
                            <Snowflake aria-hidden="true" className="size-4" />
                            {t('admin.review.frozen')}
                        </span>
                        <span>{t('admin.review.frozen_text')}</span>
                    </div>
                    <section
                        aria-labelledby="versao-titulo"
                        lang={article.language?.replace('_', '-') ?? undefined}
                        className="rounded-card border border-border bg-surface p-[clamp(20px,3vw,36px)]"
                    >
                        <div className="mb-4 flex flex-wrap items-center gap-2.5 text-meta text-text-secondary">
                            {article.category && (
                                <Pill tone={article.category.color}>
                                    {article.category.name}
                                </Pill>
                            )}
                            <span>
                                {t('admin.review.meta', {
                                    language: article.language
                                        ? t(
                                              `search.filters.languages.${article.language}` as never,
                                          )
                                        : '—',
                                    minutes: article.readingMinutes,
                                    words: version.words.toLocaleString(
                                        locale.replace('_', '-'),
                                    ),
                                })}
                            </span>
                        </div>
                        <h2
                            id="versao-titulo"
                            className="mb-6 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.2] font-extrabold tracking-[-0.02em] break-words"
                        >
                            {article.title || t('preview.untitled')}
                        </h2>
                        {article.cover && (
                            <img
                                src={article.cover.src}
                                srcSet={article.cover.srcset || undefined}
                                sizes="(min-width: 1280px) 760px, 100vw"
                                width={article.cover.width}
                                height={article.cover.height}
                                alt={article.cover.alt}
                                className="mb-8 aspect-video w-full rounded-card bg-surface-muted object-cover"
                            />
                        )}
                        <ArticleBody
                            html={article.html}
                            lang={article.language}
                        />
                        {article.tags.length > 0 && (
                            <ul
                                aria-label={t('article.tags')}
                                className="mt-8 flex flex-wrap gap-2"
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
                    </section>
                </div>

                <aside
                    aria-label={t('admin.review.decision')}
                    className="flex flex-col gap-4 xl:sticky xl:top-6"
                >
                    <section
                        aria-labelledby="sobre-titulo"
                        className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5"
                    >
                        <h2
                            id="sobre-titulo"
                            className="font-display text-[1.125rem] font-extrabold"
                        >
                            {t('admin.review.about')}
                        </h2>
                        <span className="flex items-center gap-2.5">
                            <UserAvatar
                                name={author.name}
                                avatar={author.avatar}
                                className="size-9 text-caption"
                            />
                            <span className="flex flex-col text-meta">
                                <strong>{author.name}</strong>
                                {author.username && (
                                    <span className="text-caption text-text-secondary">
                                        @{author.username}
                                    </span>
                                )}
                            </span>
                        </span>
                        <p
                            className={cn(
                                'text-meta',
                                version.late
                                    ? 'font-bold text-warning-fg'
                                    : 'text-text-secondary',
                            )}
                        >
                            {t('admin.review.sent', {
                                when: sent,
                                waiting: waiting(version.submittedAt),
                                hours: lateHours,
                            })}{' '}
                            ·{' '}
                            {version.edit
                                ? t('admin.review.kind_edit')
                                : t('admin.review.kind_new')}
                        </p>
                        {version.liveUrl && (
                            <a
                                href={version.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-meta font-bold text-primary-text hover:underline"
                            >
                                <ExternalLink
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                {t('admin.review.live')}
                            </a>
                        )}
                        <ul className="flex flex-col gap-1.5 text-meta">
                            <CheckItem
                                ok={version.imagesWithAlt === version.images}
                            >
                                {version.images === 0
                                    ? t('admin.review.checks.no_images')
                                    : t('admin.review.checks.alt', {
                                          done: version.imagesWithAlt,
                                          total: version.images,
                                      })}
                            </CheckItem>
                            <li className="flex items-center gap-2">
                                <Link2
                                    aria-hidden="true"
                                    className="size-4 text-text-secondary"
                                />
                                {t('admin.review.checks.links', {
                                    count: version.links,
                                })}
                            </li>
                            <li className="flex items-center gap-2">
                                <Languages
                                    aria-hidden="true"
                                    className="size-4 text-text-secondary"
                                />
                                {t('admin.review.checks.language', {
                                    language: article.language
                                        ? t(
                                              `search.filters.languages.${article.language}` as never,
                                          )
                                        : '—',
                                })}
                            </li>
                        </ul>
                    </section>

                    <section
                        aria-labelledby="decisao-titulo"
                        className="rounded-card border border-border bg-surface p-5"
                    >
                        <h2
                            id="decisao-titulo"
                            className="mb-3 font-display text-[1.125rem] font-extrabold"
                        >
                            {t('admin.review.decision')}
                        </h2>
                        <Form
                            {...decide.form(version.id)}
                            className="flex flex-col gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <fieldset className="flex flex-col gap-2">
                                        <legend className="sr-only">
                                            {t('admin.review.decision')}
                                        </legend>
                                        {(['approve', 'reject'] as const).map(
                                            (option) => (
                                                <label
                                                    key={option}
                                                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3.5 py-2.5 font-bold has-checked:border-primary has-checked:bg-surface-selected has-checked:text-text-on-selected"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="decision"
                                                        value={option}
                                                        checked={
                                                            decision === option
                                                        }
                                                        onChange={() =>
                                                            setDecision(option)
                                                        }
                                                        className="size-4 accent-primary"
                                                    />
                                                    {t(
                                                        `admin.review.${option}`,
                                                    )}
                                                </label>
                                            ),
                                        )}
                                    </fieldset>

                                    {decision === null && (
                                        <p className="text-meta text-text-secondary">
                                            {t('admin.review.choose')}
                                        </p>
                                    )}

                                    {decision === 'reject' && (
                                        <>
                                            <DecisionFields
                                                idPrefix="revisao"
                                                items={policyItems}
                                                errors={errors}
                                                reasonHint={t(
                                                    'admin.review.reason_hint',
                                                )}
                                            />
                                            <p className="rounded-xl bg-surface-muted p-3 text-meta">
                                                <strong>
                                                    {t(
                                                        'admin.review.recipient',
                                                    )}
                                                </strong>{' '}
                                                {t(
                                                    version.edit
                                                        ? 'admin.review.reject_effect_edit'
                                                        : 'admin.review.reject_effect',
                                                )}
                                            </p>
                                        </>
                                    )}

                                    {decision === 'approve' && (
                                        <p className="rounded-xl bg-surface-muted p-3 text-meta">
                                            {t(
                                                version.edit
                                                    ? 'admin.review.approve_effect_edit'
                                                    : 'admin.review.approve_effect',
                                            )}
                                        </p>
                                    )}

                                    {errors.decision && (
                                        <p className="flex items-center gap-1.5 text-meta font-bold text-danger-fg">
                                            <CircleAlert
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                            {errors.decision}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap justify-end gap-2">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="md"
                                        >
                                            <Link href={queue()}>
                                                {t('moderation.cancel')}
                                            </Link>
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="md"
                                            variant={
                                                decision === 'reject'
                                                    ? 'destructive'
                                                    : 'default'
                                            }
                                            disabled={
                                                processing || decision === null
                                            }
                                        >
                                            {processing && <Spinner />}
                                            {decision === 'reject'
                                                ? t(
                                                      'admin.review.reject_submit',
                                                  )
                                                : t(
                                                      'admin.review.approve_submit',
                                                  )}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                        {(position.previous !== null ||
                            position.next !== null) && (
                            <p className="mt-4 text-caption text-text-secondary">
                                <kbd className="rounded border border-border px-1 font-mono">
                                    J
                                </kbd>{' '}
                                {t('admin.review.next')} ·{' '}
                                <kbd className="rounded border border-border px-1 font-mono">
                                    K
                                </kbd>{' '}
                                {t('admin.review.previous')}
                            </p>
                        )}
                    </section>
                </aside>
            </div>
        </>
    );
}

function CheckItem({
    ok,
    children,
}: {
    ok: boolean;
    children: React.ReactNode;
}) {
    return (
        <li className="flex items-center gap-2">
            {ok ? (
                <Check aria-hidden="true" className="size-4 text-success-fg" />
            ) : (
                <CircleAlert
                    aria-hidden="true"
                    className="size-4 text-warning-fg"
                />
            )}
            {children}
        </li>
    );
}
