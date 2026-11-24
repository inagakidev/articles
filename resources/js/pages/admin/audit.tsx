import { Head, router } from '@inertiajs/react';
import { Download, Lock, ScrollText, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import { shortDate, time } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { audit } from '@/routes/admin';
import { exportMethod } from '@/routes/admin/audit';

type AuditRecord = {
    id: number;
    createdAt: string;
    actor: string;
    action: string;
    target: string;
    item: string | null;
    reason: string | null;
};

type Filters = {
    q: string | null;
    acao: string | null;
    periodo: number | null;
};

type Props = {
    records: {
        data: AuditRecord[];
        currentPage: number;
        lastPage: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    filters: Filters;
    actions: { value: string; label: string }[];
    periods: number[];
};

function query(filters: Filters, page = 1): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (filters.q) params.q = filters.q;
    if (filters.acao) params.acao = filters.acao;
    if (filters.periodo) params.periodo = filters.periodo;
    if (page > 1) params.page = page;

    return params;
}

/**
 * Auditoria (prancha "Auditoria", RF-259, RF-291): as ações administrativas,
 * com quem fez, o item e a justificativa. Só consulta e exporta.
 */
export default function Audit({ records, filters, actions, periods }: Props) {
    const { t, locale } = useTranslation();
    const [q, setQ] = useState(filters.q ?? '');

    function go(next: Partial<Filters>) {
        router.get(
            audit({ query: query({ ...filters, ...next }) }).url,
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
            <Head title={t('audit.title')} />

            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                        {t('audit.title')}
                    </h1>
                    <p className="mt-1.5 text-label text-text-secondary">
                        {t('audit.lead')}
                    </p>
                </div>
                <Button asChild variant="outline" size="md">
                    <a href={exportMethod({ query: query(filters) }).url}>
                        <Download aria-hidden="true" />
                        {t('audit.export')}
                    </a>
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <form
                    role="search"
                    onSubmit={search}
                    className="relative w-full sm:w-80"
                >
                    <label htmlFor="auditoria-busca" className="sr-only">
                        {t('audit.search')}
                    </label>
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-secondary"
                    />
                    <input
                        id="auditoria-busca"
                        type="search"
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        placeholder={t('audit.search')}
                        className="h-11 w-full rounded-xl border border-border-strong bg-surface pr-3 pl-10 text-[0.9375rem] placeholder:text-text-secondary focus-visible:outline-offset-[-1px]"
                    />
                </form>
                <select
                    aria-label={t('audit.filters.action')}
                    value={filters.acao ?? ''}
                    onChange={(event) =>
                        go({ acao: event.target.value || null })
                    }
                    className="h-11 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem]"
                >
                    <option value="">{t('audit.filters.all_actions')}</option>
                    {actions.map((action) => (
                        <option key={action.value} value={action.value}>
                            {action.label}
                        </option>
                    ))}
                </select>
                <select
                    aria-label={t('audit.filters.period')}
                    value={filters.periodo ?? ''}
                    onChange={(event) =>
                        go({ periodo: Number(event.target.value) || null })
                    }
                    className="h-11 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem]"
                >
                    <option value="">{t('audit.filters.all_time')}</option>
                    {periods.map((days) => (
                        <option key={days} value={days}>
                            {t('audit.filters.last_days', { days })}
                        </option>
                    ))}
                </select>
            </div>

            <p className="flex items-center gap-2 rounded-2xl bg-surface-muted px-4 py-3 text-meta">
                <Lock
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary-text"
                />
                {t('audit.append_only')}
            </p>

            {records.total === 0 ? (
                <EmptyState
                    Icon={ScrollText}
                    title={t('audit.empty.title')}
                    text={t('audit.empty.text')}
                    className="rounded-card border border-border bg-surface"
                />
            ) : (
                <>
                    <div
                        tabIndex={0}
                        role="region"
                        aria-label={t('audit.caption')}
                        className="overflow-x-auto rounded-card border border-border bg-surface"
                    >
                        <table className="w-full min-w-200 text-left text-meta">
                            <caption className="sr-only">
                                {t('audit.caption')}
                            </caption>
                            <thead className="text-caption font-bold text-text-secondary">
                                <tr className="border-b border-border">
                                    {(
                                        [
                                            'when',
                                            'who',
                                            'action',
                                            'target',
                                            'item',
                                            'reason',
                                        ] as const
                                    ).map((column) => (
                                        <th
                                            key={column}
                                            scope="col"
                                            className="px-4 py-3 font-bold"
                                        >
                                            {t(`audit.columns.${column}`)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {records.data.map((record) => (
                                    <tr
                                        key={record.id}
                                        className="border-b border-border align-top last:border-b-0"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {shortDate(
                                                record.createdAt,
                                                locale,
                                            )}
                                            , {time(record.createdAt, locale)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {record.actor}
                                        </td>
                                        <td className="px-4 py-3 font-bold">
                                            {record.action}
                                        </td>
                                        <td className="max-w-70 px-4 py-3">
                                            {record.target}
                                        </td>
                                        <td className="px-4 py-3">
                                            {record.item ?? '—'}
                                        </td>
                                        <td className="max-w-80 px-4 py-3 text-text-secondary">
                                            {record.reason ?? '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p
                        role="status"
                        className="text-center text-meta text-text-secondary"
                    >
                        {records.total === 1
                            ? t('audit.status_one')
                            : t('audit.status', {
                                  first: records.from ?? 0,
                                  last: records.to ?? 0,
                                  count: records.total,
                              })}
                    </p>
                    <Pagination
                        current={records.currentPage}
                        last={records.lastPage}
                        href={(page) =>
                            audit({ query: query(filters, page) }).url
                        }
                    />
                </>
            )}
        </>
    );
}
