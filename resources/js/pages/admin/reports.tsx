import { Form, Head, Link, router } from '@inertiajs/react';
import { ExternalLink, Flag } from 'lucide-react';
import { useState } from 'react';
import DecisionFields from '@/components/moderation/decision-fields';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import TableRegion from '@/components/ui/table-region';
import { Spinner } from '@/components/ui/spinner';
import UserAvatar from '@/components/ui/user-avatar';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { reports } from '@/routes/admin';
import SegmentedNav from '@/components/ui/segmented-nav';
import { useQueueKeys } from '@/hooks/use-queue-keys';
import * as reportRoutes from '@/routes/admin/reports';

type Target = 'article' | 'comment' | 'profile';
type Status = 'abertas' | 'procedentes' | 'improcedentes' | 'removidas';
type TypeFilter = 'artigos' | 'comentarios' | 'perfis';
type Outcome =
    | 'dismiss'
    | 'unpublish_article'
    | 'delete_article'
    | 'delete_comment'
    | 'moderate_profile';

type Person = { name: string; username: string; avatar: string | null };

/** O item como está agora (`ReportedItem`); nulo se já saiu. */
type Item = {
    title: string | null;
    text: string | null;
    author: Person | null;
    url: string | null;
    replies: number | null;
    hasPhoto?: boolean;
} | null;

type Group = {
    target: Target;
    id: number;
    count: number;
    /** Quem escreveu tem penalidade ativa: analisar primeiro (RF-216). */
    priority: boolean;
    since: string;
    reasons: string[];
    item: Item;
};

type Selected = {
    target: Target;
    id: number;
    item: Item;
    status: 'open' | 'upheld' | 'dismissed' | 'removed';
    reasons: Record<string, number>;
    details: string[];
    count: number;
    outcomes: Outcome[];
    decision: {
        outcome: Outcome | null;
        policyItem: string | null;
        justification: string | null;
        decidedAt: string | null;
    } | null;
};

type Key = { target: Target; id: number } | null;

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
                <Analysis
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

function PersonLine({ person }: { person: Person }) {
    return (
        <span className="flex items-center gap-2.5">
            <UserAvatar
                name={person.name}
                avatar={person.avatar}
                className="size-8 text-badge"
            />
            <span className="flex flex-col">
                <strong>{person.name}</strong>
                <span className="text-caption text-text-secondary">
                    @{person.username}
                </span>
            </span>
        </span>
    );
}

/** A análise: o conteúdo como está agora, os motivos e a decisão. */
function Analysis({
    selected,
    policyItems,
    durations,
    backHref,
}: {
    selected: Selected;
    policyItems: PolicyItem[];
    durations: number[];
    backHref: string;
}) {
    const { t, locale } = useTranslation();
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    const [penalize, setPenalize] = useState(false);
    const item = selected.item;
    const open = selected.status === 'open';

    return (
        <section
            aria-labelledby="analise-titulo"
            className="flex flex-col gap-5 rounded-card border border-border bg-surface p-6"
        >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                    id="analise-titulo"
                    className="font-display text-h3 font-extrabold"
                >
                    {t(`reports.admin.analysis.${selected.target}`)}
                </h2>
                <span className="text-meta text-text-secondary">
                    {selected.count === 1
                        ? t('reports.admin.count_one')
                        : t('reports.admin.count', { count: selected.count })}
                </span>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-surface-muted p-4">
                <span className="text-caption font-bold tracking-[0.06em] text-text-secondary uppercase">
                    {t('reports.admin.current')}
                </span>
                {item ? (
                    <>
                        {item.author && <PersonLine person={item.author} />}
                        {item.title && selected.target === 'article' && (
                            <strong className="font-display text-lg">
                                {item.title}
                            </strong>
                        )}
                        {selected.target === 'profile' && (
                            <span className="text-meta text-text-secondary">
                                {item.hasPhoto
                                    ? t('reports.admin.has_photo')
                                    : t('reports.admin.no_photo')}
                            </span>
                        )}
                        {item.text ? (
                            <p className="text-body whitespace-pre-line">
                                {selected.target === 'comment'
                                    ? `“${item.text}”`
                                    : item.text}
                            </p>
                        ) : (
                            selected.target === 'profile' && (
                                <p className="text-meta text-text-secondary">
                                    {t('reports.admin.no_bio')}
                                </p>
                            )
                        )}
                        {item.url && (
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 self-start text-meta font-bold text-primary-text hover:underline"
                            >
                                <ExternalLink
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                {t(`reports.admin.open.${selected.target}`)}
                            </a>
                        )}
                    </>
                ) : (
                    <p className="text-meta text-text-secondary">
                        {t('reports.admin.gone')}
                    </p>
                )}
            </div>

            <div className="text-meta">
                <strong>{t('reports.admin.reasons')}</strong>{' '}
                {Object.entries(selected.reasons)
                    .map(
                        ([reason, count]) =>
                            `${t(`reports.reasons.${reason}` as 'reports.reasons.spam').toLowerCase()} (${count})`,
                    )
                    .join(', ')}
                .
                {selected.details.map((detail, index) => (
                    <q key={index} className="mt-1 block text-text-secondary">
                        {detail}
                    </q>
                ))}
            </div>

            {open ? (
                <Form
                    {...reportRoutes.decide.form({
                        target: selected.target,
                        id: selected.id,
                    })}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <fieldset className="flex flex-col gap-2">
                                <legend className="mb-2 text-label font-bold">
                                    {t('reports.admin.decision')}
                                </legend>
                                {selected.outcomes.map((option) => (
                                    <label
                                        key={option}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3',
                                            outcome === option
                                                ? 'border-primary bg-surface-selected/50'
                                                : 'border-border-strong hover:bg-surface-hover',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="outcome"
                                            value={option}
                                            checked={outcome === option}
                                            onChange={() => setOutcome(option)}
                                            className="size-4 accent-primary"
                                        />
                                        <span className="text-label font-bold">
                                            {t(
                                                `reports.admin.outcomes.${option}`,
                                            )}
                                        </span>
                                    </label>
                                ))}
                                {errors.outcome && (
                                    <p className="text-meta text-danger-fg">
                                        {errors.outcome}
                                    </p>
                                )}
                            </fieldset>

                            {outcome === 'moderate_profile' && (
                                <fieldset className="flex flex-col gap-2">
                                    <legend className="mb-2 text-label font-bold">
                                        {t('reports.admin.reset')}
                                    </legend>
                                    {(
                                        ['photo', 'bio', 'username'] as const
                                    ).map((part) => (
                                        <label
                                            key={part}
                                            className="flex items-center gap-2.5 text-label"
                                        >
                                            <input
                                                type="checkbox"
                                                name={part}
                                                value="1"
                                                className="size-4 accent-primary"
                                            />
                                            {t(`reports.admin.parts.${part}`)}
                                        </label>
                                    ))}
                                </fieldset>
                            )}

                            {outcome && (
                                <DecisionFields
                                    idPrefix={`denuncia-${selected.target}-${selected.id}`}
                                    items={policyItems}
                                    errors={errors}
                                    withItem={outcome !== 'dismiss'}
                                    reasonHint={t('reports.admin.reason_hint')}
                                />
                            )}

                            {outcome && outcome !== 'dismiss' && (
                                <div className="flex flex-col gap-2 rounded-xl border border-border-strong p-3.5">
                                    <label className="flex items-center gap-2.5 text-label font-bold">
                                        <input
                                            type="checkbox"
                                            checked={penalize}
                                            onChange={(event) =>
                                                setPenalize(
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 accent-primary"
                                        />
                                        {t('reports.admin.penalize')}
                                    </label>
                                    {penalize && (
                                        <div className="flex flex-col gap-1.5 pl-6.5">
                                            <label
                                                htmlFor={`denuncia-penalidade-${selected.id}`}
                                                className="text-meta font-bold"
                                            >
                                                {t('penalties.fields.days')}
                                            </label>
                                            <select
                                                id={`denuncia-penalidade-${selected.id}`}
                                                name="penalty_days"
                                                defaultValue={durations[0]}
                                                className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] sm:w-60"
                                            >
                                                {durations.map((days) => (
                                                    <option
                                                        key={days}
                                                        value={days}
                                                    >
                                                        {t('penalties.days', {
                                                            days,
                                                        })}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="text-caption text-text-secondary">
                                                {t(
                                                    'reports.admin.penalize_hint',
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {outcome === 'delete_comment' &&
                                (item?.replies ?? 0) > 0 && (
                                    <p className="rounded-xl bg-warning-bg px-3.5 py-3 text-meta text-warning-on-bg">
                                        {item?.replies === 1
                                            ? t('reports.admin.replies_one')
                                            : t('reports.admin.replies', {
                                                  count: item?.replies ?? 0,
                                              })}
                                    </p>
                                )}

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-caption text-text-secondary">
                                    {t('reports.admin.keys')}
                                </span>
                                <div className="flex gap-2">
                                    <Button asChild variant="ghost" size="md">
                                        <Link href={backHref}>
                                            {t('moderation.cancel')}
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="md"
                                        variant={
                                            outcome && outcome !== 'dismiss'
                                                ? 'destructive'
                                                : 'default'
                                        }
                                        disabled={
                                            processing || outcome === null
                                        }
                                    >
                                        {processing && <Spinner />}
                                        {outcome
                                            ? t(
                                                  `reports.admin.submit.${outcome}`,
                                              )
                                            : t('reports.admin.submit.none')}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            ) : (
                <dl className="grid gap-2 text-meta sm:grid-cols-[max-content_1fr] sm:gap-x-6">
                    <dt className="font-bold">
                        {t('reports.admin.status_label')}
                    </dt>
                    <dd>{t(`reports.admin.result.${selected.status}`)}</dd>
                    {selected.decision?.outcome && (
                        <>
                            <dt className="font-bold">
                                {t('reports.admin.decision')}
                            </dt>
                            <dd>
                                {t(
                                    `reports.admin.outcomes.${selected.decision.outcome}`,
                                )}
                            </dd>
                        </>
                    )}
                    {selected.decision?.policyItem && (
                        <>
                            <dt className="font-bold">
                                {t('moderation.fields.policy_item')}
                            </dt>
                            <dd>{selected.decision.policyItem}</dd>
                        </>
                    )}
                    {selected.decision?.justification && (
                        <>
                            <dt className="font-bold">
                                {t('reports.admin.justification')}
                            </dt>
                            <dd>{selected.decision.justification}</dd>
                        </>
                    )}
                    {selected.decision?.decidedAt && (
                        <>
                            <dt className="font-bold">
                                {t('reports.admin.decided_at')}
                            </dt>
                            <dd>
                                {shortDate(selected.decision.decidedAt, locale)}
                            </dd>
                        </>
                    )}
                </dl>
            )}
        </section>
    );
}
