import { Head, Link, router } from '@inertiajs/react';
import { CircleCheck, Clock, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import TableRegion from '@/components/ui/table-region';
import UserAvatar from '@/components/ui/user-avatar';
import { waiting } from '@/components/moderation/waiting';
import { isToday, shortDate, time } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { queue, review } from '@/routes/admin';

type QueuedVersion = {
    id: number;
    title: string | null;
    author: { name: string; username: string | null; avatar: string | null };
    type: 'new' | 'edit';
    category: string | null;
    submittedAt: string | null;
    late: boolean;
};

type Props = {
    versions: {
        data: QueuedVersion[];
        currentPage: number;
        lastPage: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: { q: string | null; tipo: 'new' | 'edit' | null };
    lateHours: number;
};

function queueUrl(filters: Props['filters'], page = 1): string {
    const query: Record<string, string | number> = {};

    if (filters.q) query.q = filters.q;
    if (filters.tipo) query.tipo = filters.tipo;
    if (page > 1) query.page = page;

    return queue({ query }).url;
}

/**
 * Fila de aprovação (prancha "Fila de aprovação", RF-249, RF-378): as que
 * esperam há mais tempo primeiro, com o atraso depois de 6 horas.
 */
export default function Queue({ versions, filters, lateHours }: Props) {
    const { t, locale } = useTranslation();
    const [q, setQ] = useState(filters.q ?? '');

    function go(next: Partial<Props['filters']>) {
        router.get(
            queueUrl({ ...filters, ...next }),
            {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function search(event: FormEvent) {
        event.preventDefault();
        go({ q: q.trim() || null });
    }

    return (
        <>
            <Head title={t('admin.queue.title')} />

            <div>
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                    {t('admin.queue.title')}
                </h1>
                <p className="mt-1.5 text-label text-text-secondary">
                    {t('admin.queue.lead')}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <form
                    role="search"
                    onSubmit={search}
                    className="relative w-full sm:w-80"
                >
                    <label htmlFor="fila-busca" className="sr-only">
                        {t('admin.queue.search')}
                    </label>
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-secondary"
                    />
                    <input
                        id="fila-busca"
                        type="search"
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        placeholder={t('admin.queue.search')}
                        className="h-11 w-full rounded-xl border border-border-strong bg-surface pr-3 pl-10 text-[0.9375rem] placeholder:text-text-secondary focus-visible:outline-offset-[-1px]"
                    />
                </form>
                <select
                    aria-label={t('admin.queue.type.label')}
                    value={filters.tipo ?? ''}
                    onChange={(event) =>
                        go({
                            tipo:
                                (event.target.value as 'new' | 'edit') || null,
                        })
                    }
                    className="h-11 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem]"
                >
                    <option value="">{t('admin.queue.type.all')}</option>
                    <option value="new">
                        {t('admin.queue.type.new_plural')}
                    </option>
                    <option value="edit">
                        {t('admin.queue.type.edit_plural')}
                    </option>
                </select>
                <span className="text-meta text-text-secondary">
                    {t('admin.queue.order', { hours: lateHours })}
                </span>
            </div>

            {versions.total === 0 ? (
                <EmptyState
                    Icon={CircleCheck}
                    title={
                        filters.q || filters.tipo
                            ? t('admin.queue.empty_filtered.title')
                            : t('admin.queue.empty.title')
                    }
                    text={
                        filters.q || filters.tipo
                            ? t('admin.queue.empty_filtered.text')
                            : t('admin.queue.empty.text')
                    }
                    className="rounded-card border border-border bg-surface"
                />
            ) : (
                <>
                    <TableRegion label={t('admin.queue.caption')}>
                        <table className="w-full min-w-200 text-left text-meta">
                            <caption className="sr-only">
                                {t('admin.queue.caption')}
                            </caption>
                            <thead className="text-caption font-bold text-text-secondary">
                                <tr className="border-b border-border">
                                    {(
                                        [
                                            'article',
                                            'author',
                                            'type',
                                            'category',
                                            'sent',
                                            'waiting',
                                        ] as const
                                    ).map((column) => (
                                        <th
                                            key={column}
                                            scope="col"
                                            className="px-4 py-3 font-bold"
                                        >
                                            {t(`admin.queue.column.${column}`)}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-4 py-3">
                                        <span className="sr-only">
                                            {t('admin.queue.column.actions')}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {versions.data.map((version) => (
                                    <QueueRow
                                        key={version.id}
                                        version={version}
                                        locale={locale}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </TableRegion>
                    <p
                        role="status"
                        className="text-center text-meta text-text-secondary"
                    >
                        {t('admin.queue.status', {
                            count: versions.total,
                            first: versions.from ?? 0,
                            last: versions.to ?? 0,
                        })}
                    </p>
                    <Pagination
                        current={versions.currentPage}
                        last={versions.lastPage}
                        href={(page) => queueUrl(filters, page)}
                    />
                </>
            )}
        </>
    );
}

function QueueRow({
    version,
    locale,
}: {
    version: QueuedVersion;
    locale: Locale;
}) {
    const { t } = useTranslation();
    const title = version.title || t('preview.untitled');
    const reviewLabel =
        version.type === 'edit'
            ? t('admin.queue.review_edit', { title })
            : t('admin.queue.review', { title });

    return (
        <tr className="border-b border-border last:border-b-0">
            <td className="max-w-80 px-4 py-3.5">
                <Link
                    href={review(version.id)}
                    className="font-bold hover:underline"
                >
                    {title}
                </Link>
            </td>
            <td className="px-4 py-3.5">
                <span className="flex items-center gap-2.5">
                    <UserAvatar
                        name={version.author.name}
                        avatar={version.author.avatar}
                        className="size-8 text-badge"
                    />
                    <span className="flex flex-col">
                        <strong>{version.author.name}</strong>
                        {version.author.username && (
                            <span className="text-caption text-text-secondary">
                                @{version.author.username}
                            </span>
                        )}
                    </span>
                </span>
            </td>
            <td className="px-4 py-3.5">
                <span
                    className={cn(
                        'inline-flex rounded-md px-2 py-0.5 text-caption font-bold',
                        version.type === 'edit'
                            ? 'bg-pastel-blue text-pastel-blue-fg'
                            : 'bg-pastel-lavender text-pastel-lavender-fg',
                    )}
                >
                    {t(`admin.queue.type.${version.type}`)}
                </span>
            </td>
            <td className="px-4 py-3.5">{version.category ?? '—'}</td>
            <td className="px-4 py-3.5 whitespace-nowrap">
                {version.submittedAt
                    ? isToday(version.submittedAt)
                        ? t('admin.queue.today_at', {
                              time: time(version.submittedAt, locale),
                          })
                        : `${shortDate(version.submittedAt, locale)}, ${time(version.submittedAt, locale)}`
                    : '—'}
            </td>
            <td className="px-4 py-3.5 whitespace-nowrap">
                {version.late ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-warning-bg px-2 py-0.5 text-caption font-bold text-warning-fg">
                        <Clock aria-hidden="true" className="size-3.5" />
                        {t('admin.queue.late', {
                            time: waiting(version.submittedAt),
                        })}
                    </span>
                ) : (
                    waiting(version.submittedAt)
                )}
            </td>
            <td className="px-4 py-3.5 text-right">
                <Button asChild size="sm" variant="outline">
                    <Link href={review(version.id)} aria-label={reviewLabel}>
                        {t('admin.queue.review_action')}
                    </Link>
                </Button>
            </td>
        </tr>
    );
}
