import { Form, Head, Link, router } from '@inertiajs/react';
import { Gavel, RotateCcw, UserRound } from 'lucide-react';
import { useState } from 'react';
import DecisionFields from '@/components/moderation/decision-fields';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import TableRegion from '@/components/ui/table-region';
import UserAvatar from '@/components/ui/user-avatar';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { reopen } from '@/routes/admin/penalties';
import { ban, reactivate, suspend } from '@/routes/admin/users';
import { show as profile } from '@/routes/profiles';

type PenaltyRow = {
    id: number;
    type: 'suspension' | 'ban';
    days: number | null;
    policyItem: string;
    appliedBy: string | null;
    startsAt: string;
    status: 'active' | 'ended' | 'annulled';
    reopenable: boolean;
};

type Props = {
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
        avatar: string | null;
        since: string | null;
        verified: boolean;
        admin: boolean;
        suspendedUntil: string | null;
        banned: boolean;
    };
    stats: {
        published: number;
        comments: number;
        pending: number;
        openReports: number;
        penalties: number;
    };
    penalties: PenaltyRow[];
    canPenalize: boolean;
    durations: number[];
    appealDays: number;
    policyItems: PolicyItem[];
};

const options = { preserveScroll: true };

/**
 * A conta no painel (prancha "Admin · Usuário e penalidade", D92): os
 * números, o histórico de penalidades e aplicar suspensão ou banimento,
 * mostrando antes o efeito. Reativar e reabrir o prazo também saem daqui.
 */
export default function AdminUser({
    user,
    stats,
    penalties,
    canPenalize,
    durations,
    appealDays,
    policyItems,
}: Props) {
    const { t, locale } = useTranslation();
    const [open, setOpen] = useState(false);
    const penalized = user.banned || user.suspendedUntil !== null;

    return (
        <>
            <Head
                title={t('admin.users.user_title', { username: user.username })}
            />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <UserAvatar
                        name={user.name}
                        avatar={user.avatar}
                        className="size-16 text-h3"
                    />
                    <div className="flex flex-col gap-1">
                        <h1 className="font-display text-[1.75rem]/9 font-extrabold tracking-[-0.02em]">
                            {user.name}
                        </h1>
                        <p className="text-meta text-text-secondary">
                            @{user.username} · {user.email}
                            {user.since &&
                                ` · ${t('admin.users.since', { date: shortDate(user.since, locale) })}`}
                        </p>
                        <p className="flex flex-wrap gap-2 text-caption font-bold">
                            {user.verified && (
                                <span className="rounded-md bg-success-bg px-2 py-0.5 text-success-on-bg">
                                    {t('admin.users.verified')}
                                </span>
                            )}
                            {user.suspendedUntil && (
                                <span className="rounded-md bg-warning-bg px-2 py-0.5 text-warning-on-bg">
                                    {t('admin.users.suspended_until', {
                                        date: shortDate(
                                            user.suspendedUntil,
                                            locale,
                                        ),
                                    })}
                                </span>
                            )}
                            {user.banned && (
                                <span className="rounded-md bg-danger-bg px-2 py-0.5 text-danger-on-bg">
                                    {t('admin.users.banned_retained')}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!user.banned && (
                        <Button asChild variant="outline" size="md">
                            <Link href={profile({ username: user.username })}>
                                <UserRound aria-hidden="true" />
                                {t('admin.users.public_profile')}
                            </Link>
                        </Button>
                    )}
                    {penalized && (
                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={() =>
                                router.post(
                                    reactivate(user.id).url,
                                    {},
                                    options,
                                )
                            }
                        >
                            <RotateCcw aria-hidden="true" />
                            {t('admin.users.reactivate')}
                        </Button>
                    )}
                    {canPenalize && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="md"
                            onClick={() => setOpen(true)}
                        >
                            <Gavel aria-hidden="true" />
                            {t('penalties.apply')}
                        </Button>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
                {(
                    [
                        'published',
                        'comments',
                        'openReports',
                        'penalties',
                    ] as const
                ).map((key) => (
                    <div
                        key={key}
                        className="rounded-card border border-border bg-surface p-4"
                    >
                        <dt className="text-caption font-bold text-text-secondary">
                            {t(`admin.users.stats.${key}`)}
                        </dt>
                        <dd className="mt-1 font-display text-h3 font-extrabold">
                            {stats[key]}
                        </dd>
                    </div>
                ))}
            </dl>

            <section
                aria-labelledby="historico"
                className="flex flex-col gap-3"
            >
                <h2
                    id="historico"
                    className="font-display text-h3 font-extrabold"
                >
                    {t('admin.users.history')}
                </h2>
                {penalties.length === 0 ? (
                    <p className="text-meta text-text-secondary">
                        {t('admin.users.no_history')}
                    </p>
                ) : (
                    <TableRegion label={t('admin.users.history')}>
                        <table className="w-full min-w-150 text-left text-meta">
                            <thead className="text-caption font-bold text-text-secondary">
                                <tr className="border-b border-border">
                                    {(
                                        [
                                            'date',
                                            'type',
                                            'item',
                                            'by',
                                            'status',
                                        ] as const
                                    ).map((column) => (
                                        <th
                                            key={column}
                                            scope="col"
                                            className="px-4 py-3 font-bold"
                                        >
                                            {t(
                                                `admin.users.history_columns.${column}`,
                                            )}
                                        </th>
                                    ))}
                                    <th scope="col" className="px-4 py-3">
                                        <span className="sr-only">
                                            {t(
                                                'admin.users.history_columns.actions',
                                            )}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {penalties.map((penalty) => (
                                    <tr
                                        key={penalty.id}
                                        className="border-b border-border last:border-b-0"
                                    >
                                        <td className="px-4 py-3">
                                            {shortDate(
                                                penalty.startsAt,
                                                locale,
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {penalty.type === 'suspension'
                                                ? t(
                                                      'penalties.suspension_days',
                                                      {
                                                          days:
                                                              penalty.days ?? 0,
                                                      },
                                                  )
                                                : t('penalties.ban')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {penalty.policyItem}
                                        </td>
                                        <td className="px-4 py-3">
                                            {penalty.appliedBy ?? '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {t(
                                                `penalties.status.${penalty.status}`,
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {penalty.reopenable && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.post(
                                                            reopen(penalty.id)
                                                                .url,
                                                            {},
                                                            options,
                                                        )
                                                    }
                                                >
                                                    {t('admin.users.reopen', {
                                                        days: appealDays,
                                                    })}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableRegion>
                )}
            </section>

            {canPenalize && (
                <PenaltyDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    user={user}
                    stats={stats}
                    durations={durations}
                    appealDays={appealDays}
                    policyItems={policyItems}
                />
            )}
        </>
    );
}

/** Aplicar suspensão ou banimento, com o efeito antes de confirmar. */
function PenaltyDialog({
    open,
    onClose,
    user,
    stats,
    durations,
    appealDays,
    policyItems,
}: {
    open: boolean;
    onClose: () => void;
    user: Props['user'];
    stats: Props['stats'];
    durations: number[];
    appealDays: number;
    policyItems: PolicyItem[];
}) {
    const { t, locale } = useTranslation();
    const [type, setType] = useState<'suspension' | 'ban'>('suspension');
    const [days, setDays] = useState(durations[1] ?? durations[0]);
    const [confirmed, setConfirmed] = useState(false);
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    const banning = type === 'ban';
    const action = banning ? ban.form(user.id) : suspend.form(user.id);

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-card sm:max-w-lg">
                <DialogTitle className="font-display text-h3 font-extrabold">
                    {t('penalties.apply_to', { username: user.username })}
                </DialogTitle>
                <DialogDescription className="text-meta text-text-secondary">
                    {t('penalties.apply_lead')}
                </DialogDescription>
                <Form
                    {...action}
                    options={options}
                    onSuccess={onClose}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <fieldset className="flex flex-col gap-2">
                                <legend className="mb-2 text-label font-bold">
                                    {t('penalties.fields.type')}
                                </legend>
                                {(['suspension', 'ban'] as const).map(
                                    (option) => (
                                        <label
                                            key={option}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3',
                                                type === option
                                                    ? 'border-primary bg-surface-selected/50'
                                                    : 'border-border-strong hover:bg-surface-hover',
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="type"
                                                value={option}
                                                checked={type === option}
                                                onChange={() => {
                                                    setType(option);
                                                    setConfirmed(false);
                                                }}
                                                className="size-4 accent-primary"
                                            />
                                            <span className="text-label font-bold">
                                                {t(`penalties.types.${option}`)}
                                            </span>
                                        </label>
                                    ),
                                )}
                            </fieldset>

                            {!banning && (
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="penalidade-dias"
                                        className="text-label font-bold"
                                    >
                                        {t('penalties.fields.days')}
                                    </label>
                                    <select
                                        id="penalidade-dias"
                                        name="days"
                                        value={days}
                                        onChange={(event) =>
                                            setDays(Number(event.target.value))
                                        }
                                        className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem]"
                                    >
                                        {durations.map((option) => (
                                            <option key={option} value={option}>
                                                {t('penalties.days', {
                                                    days: option,
                                                })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <DecisionFields
                                idPrefix="penalidade"
                                items={policyItems}
                                errors={errors}
                                reasonHint={t('penalties.reason_hint', {
                                    days: appealDays,
                                })}
                            />

                            {banning ? (
                                <div className="flex flex-col gap-3 rounded-2xl bg-danger-bg px-3.5 py-3 text-meta text-danger-on-bg">
                                    <p>
                                        <strong>
                                            {t('penalties.impact.ban_title')}
                                        </strong>{' '}
                                        {t('penalties.impact.ban_text', {
                                            articles: stats.published,
                                            comments: stats.comments,
                                            days: appealDays,
                                        })}
                                    </p>
                                    <label className="flex items-start gap-2.5 font-bold">
                                        <input
                                            type="checkbox"
                                            checked={confirmed}
                                            onChange={(event) =>
                                                setConfirmed(
                                                    event.target.checked,
                                                )
                                            }
                                            className="mt-0.5 size-4 accent-primary"
                                        />
                                        {t('penalties.impact.ban_confirm')}
                                    </label>
                                </div>
                            ) : (
                                <p className="rounded-2xl bg-warning-bg px-3.5 py-3 text-meta text-warning-on-bg">
                                    <strong>
                                        {t('penalties.impact.during', {
                                            days,
                                            date: shortDate(end, locale),
                                        })}
                                    </strong>{' '}
                                    {t('penalties.impact.text', {
                                        articles: stats.published,
                                        comments: stats.comments,
                                        pending: stats.pending,
                                    })}
                                </p>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    onClick={onClose}
                                >
                                    {t('moderation.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="md"
                                    disabled={
                                        processing || (banning && !confirmed)
                                    }
                                >
                                    {processing && <Spinner />}
                                    {banning
                                        ? t('penalties.submit_ban')
                                        : t('penalties.submit', { days })}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
