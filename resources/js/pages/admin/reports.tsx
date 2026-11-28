import { Head, Link, router } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import TableRegion from '@/components/ui/table-region';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { reports } from '@/routes/admin';
import SegmentedNav from '@/components/ui/segmented-nav';
import { useQueueKeys } from '@/hooks/use-queue-keys';
import * as reportRoutes from '@/routes/admin/reports';
import PersonLine from '@/components/reports/person-line';
import ReportAnalysis from '@/components/reports/report-analysis';
import type {
    Status,
    TypeFilter,
    Group,
    Selected,
    Key,
} from '@/components/reports/types';

type Props = {
    filters: { status: Status; tipo: TypeFilter | null };
    openCount: number;
    groups: {
        data: Group[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
    selected?: Selected;
    policyItems?: PolicyItem[];
    /** Durações da suspensão para "procedente com penalidade" (D92). */
    durations?: number[];
    neighbours?: { previous: Key; next: Key };
};

const STATUSES: Status[] = [
    'abertas',
    'procedentes',
    'improcedentes',
    'removidas',
];

function listUrl(filters: Props['filters'], page = 1): string {
    const query: Record<string, string | number> = {};

    if (filters.status !== 'abertas') query.status = filters.status;
    if (filters.tipo) query.tipo = filters.tipo;
    if (page > 1) query.page = page;

    return reports({ query }).url;
}

/**
 * Denúncias (prancha "Admin · Denúncias", RF-252): uma linha por item, com
 * quantas denúncias e os motivos; abrir mostra o conteúdo como está agora
 * e a decisão, que vale para todas as denúncias abertas do item.
 */
export default function Reports({
    filters,
    openCount,
    groups,
    selected,
    policyItems = [],
    durations = [],
    neighbours,
}: Props) {
    const { t, locale } = useTranslation();
    useQueueKeys(
        neighbours?.previous
            ? reportRoutes.show(neighbours.previous).url
            : null,
        neighbours?.next ? reportRoutes.show(neighbours.next).url : null,
    );

    return (
        <>
            <Head title={t('reports.admin.title')} />

            <div>
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                    {t('reports.admin.title')}
                </h1>
                <p className="mt-1.5 text-label text-text-secondary">
                    {t('reports.admin.lead')}
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <SegmentedNav
                    label={t('reports.admin.status_label')}
                    current={filters.status}
                    items={STATUSES.map((status) => ({
                        key: status,
                        href: listUrl({ ...filters, status }),
                        label:
                            status === 'abertas'
                                ? t('reports.admin.status.abertas', {
                                      count: openCount,
                                  })
                                : t(`reports.admin.status.${status}`),
                    }))}
                />
                <select
                    aria-label={t('reports.admin.type_label')}
                    value={filters.tipo ?? ''}
                    onChange={(event) =>
                        router.get(
                            listUrl({
                                ...filters,
                                tipo: (event.target.value ||
                                    null) as TypeFilter | null,
                            }),
                            {},
                            { preserveScroll: true, replace: true },
                        )
                    }
                    className="h-11 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem]"
                >
                    <option value="">{t('reports.admin.types.all')}</option>
                    <option value="artigos">
                        {t('reports.admin.types.artigos')}
                    </option>
                    <option value="comentarios">
                        {t('reports.admin.types.comentarios')}
                    </option>
                    <option value="perfis">
                        {t('reports.admin.types.perfis')}
                    </option>
                </select>
            </div>

            {groups.total === 0 ? (
                <EmptyState
                    Icon={Flag}
                    title={t('reports.admin.empty.title')}
                    text={t('reports.admin.empty.text')}
                    className="rounded-card border border-border bg-surface"
                />
            ) : (
                <>
                    <TableRegion label={t('reports.admin.caption')}>
                        <table className="w-full min-w-200 text-left text-meta">
                            <caption className="sr-only">
                                {t('reports.admin.caption')}
                            </caption>
                            <thead className="text-caption font-bold text-text-secondary">
                                <tr className="border-b border-border">
                                    {(
                                        ['item', 'reason', 'author'] as const
                                    ).map((column) => (
                                        <th
                                            key={column}
                                            scope="col"
                                            className="px-4 py-3 font-bold"
                                        >
                                            {t(
                                                `reports.admin.columns.${column}`,
                                            )}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-4 py-3">
                                        <span className="sr-only">
                                            {t('reports.admin.columns.actions')}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.data.map((group) => {
                                    const current =
                                        selected?.target === group.target &&
                                        selected.id === group.id;

                                    return (
                                        <tr
                                            key={`${group.target}-${group.id}`}
                                            className={cn(
                                                'border-b border-border align-top last:border-b-0',
                                                current &&
                                                    'bg-surface-selected/40',
                                            )}
                                        >
                                            <td className="max-w-90 px-4 py-3.5">
                                                <span className="text-caption font-bold tracking-[0.06em] text-text-secondary uppercase">
                                                    {t(
                                                        `reports.admin.target.${group.target}`,
                                                    )}
                                                </span>
                                                {group.priority && (
                                                    <span className="ml-2 rounded-md bg-warning-bg px-1.5 py-0.5 text-caption font-bold text-warning-on-bg">
                                                        {t(
                                                            'reports.admin.priority',
                                                        )}
                                                    </span>
                                                )}
                                                <span className="mt-0.5 block font-bold">
                                                    {itemLine(group, t)}
                                                </span>
                                                <span className="text-caption text-text-secondary">
                                                    {group.count === 1
                                                        ? t(
                                                              'reports.admin.count_one',
                                                          )
                                                        : t(
                                                              'reports.admin.count',
                                                              {
                                                                  count: group.count,
                                                              },
                                                          )}{' '}
                                                    ·{' '}
                                                    {shortDate(
                                                        group.since,
                                                        locale,
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {group.reasons
                                                    .map((reason) =>
                                                        t(
                                                            `reports.reasons.${reason}` as 'reports.reasons.spam',
                                                        ),
                                                    )
                                                    .join(', ')}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {group.item?.author ? (
                                                    <PersonLine
                                                        person={
                                                            group.item.author
                                                        }
                                                    />
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <Button
                                                    asChild
                                                    variant={
                                                        current
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={reportRoutes.show(
                                                            {
                                                                target: group.target,
                                                                id: group.id,
                                                            },
                                                        )}
                                                        aria-current={
                                                            current
                                                                ? 'true'
                                                                : undefined
                                                        }
                                                    >
                                                        {filters.status ===
                                                        'abertas'
                                                            ? t(
                                                                  'reports.admin.analyze',
                                                              )
                                                            : t(
                                                                  'reports.admin.view',
                                                              )}
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </TableRegion>
                    <p className="text-center text-meta text-text-secondary">
                        {t('reports.admin.footnote')}
                    </p>
                    <Pagination
                        current={groups.currentPage}
                        last={groups.lastPage}
                        href={(page) => listUrl(filters, page)}
                    />
                </>
            )}

            {selected && (
                <ReportAnalysis
                    key={`${selected.target}-${selected.id}`}
                    selected={selected}
                    policyItems={policyItems}
                    durations={durations}
                    backHref={listUrl(filters)}
                />
            )}
        </>
    );
}

type T = ReturnType<typeof useTranslation>['t'];

/** O título do artigo, o trecho do comentário ou o que é denunciável no perfil. */
function itemLine(group: Pick<Group, 'target' | 'item'>, t: T): string {
    if (!group.item) {
        return t('reports.admin.gone');
    }

    if (group.target === 'article') {
        return `“${group.item.title ?? ''}”`;
    }

    if (group.target === 'comment') {
        return t('reports.admin.comment_on', { title: group.item.title ?? '' });
    }

    return t('reports.admin.profile_parts');
}
