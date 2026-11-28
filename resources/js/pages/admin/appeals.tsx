import { Form, Head, Link } from '@inertiajs/react';
import { Scale } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import FormField from '@/components/ui/form-field';
import Pagination from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import Textarea from '@/components/ui/textarea';
import UserAvatar from '@/components/ui/user-avatar';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { appeals as appealsRoute } from '@/routes/admin';
import { decide } from '@/routes/admin/appeals';

type Status = 'open' | 'accepted' | 'rejected';

type AppealItem = {
    id: number;
    status: Status;
    body: string;
    sentAt: string;
    decisionReason: string | null;
    decidedBy: string | null;
    decidedAt: string | null;
    user: { name: string; username: string; avatar: string | null };
    penalty: {
        type: 'suspension' | 'ban';
        until: string | null;
        policyItem: string;
        reason: string;
        appliedBy: string | null;
        startsAt: string;
    };
};

type Props = {
    filters: { status: Status };
    openCount: number;
    appeals: {
        data: AppealItem[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
};

const STATUSES: Status[] = ['open', 'accepted', 'rejected'];

function listUrl(status: Status, page = 1): string {
    const query: Record<string, string | number> = {};

    if (status !== 'open') query.status = status;
    if (page > 1) query.page = page;

    return appealsRoute({ query }).url;
}

/**
 * Contestações (prancha "Contestações", RF-232 a RF-242): a penalidade
 * original, o que a pessoa escreveu e a decisão, uma vez só. Aceita, a
 * penalidade é anulada e a conta volta na hora.
 */
export default function Appeals({ filters, openCount, appeals }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('appeals.admin.title')} />

            <div>
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                    {t('appeals.admin.title')}
                </h1>
                <p className="mt-1.5 text-label text-text-secondary">
                    {t('appeals.admin.lead')}
                </p>
            </div>

            <nav
                aria-label={t('appeals.admin.status_label')}
                className="inline-flex gap-1 self-start rounded-full bg-surface-muted p-1"
            >
                {STATUSES.map((status) => (
                    <Link
                        key={status}
                        href={listUrl(status)}
                        aria-current={
                            filters.status === status ? 'page' : undefined
                        }
                        className={cn(
                            'inline-flex h-9 items-center rounded-full px-4 text-meta font-bold',
                            filters.status === status
                                ? 'bg-surface shadow-sm'
                                : 'text-text-secondary hover:text-text-primary',
                        )}
                    >
                        {status === 'open'
                            ? t('appeals.admin.open', { count: openCount })
                            : t(`appeals.admin.tabs.${status}`)}
                    </Link>
                ))}
            </nav>

            {appeals.total === 0 ? (
                <EmptyState
                    Icon={Scale}
                    title={t('appeals.admin.empty')}
                    text={t('appeals.admin.empty_text')}
                    className="rounded-card border border-border bg-surface"
                />
            ) : (
                <>
                    <ul className="flex flex-col gap-4">
                        {appeals.data.map((appeal) => (
                            <AppealCard key={appeal.id} appeal={appeal} />
                        ))}
                    </ul>
                    <Pagination
                        current={appeals.currentPage}
                        last={appeals.lastPage}
                        href={(page) => listUrl(filters.status, page)}
                    />
                </>
            )}
        </>
    );
}

function AppealCard({ appeal }: { appeal: AppealItem }) {
    const { t, locale } = useTranslation();
    const [decision, setDecision] = useState<'1' | '0' | null>(null);
    const { penalty, user } = appeal;
    const titleId = `contestacao-${appeal.id}`;
    const banned = penalty.type === 'ban';

    return (
        <li>
            <section
                aria-labelledby={titleId}
                className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <UserAvatar
                        name={user.name}
                        avatar={user.avatar}
                        className="size-10 text-caption"
                    />
                    <div className="flex flex-1 flex-col">
                        <h2 id={titleId} className="font-bold">
                            {user.name}{' '}
                            <span className="font-normal text-text-secondary">
                                @{user.username}
                            </span>
                        </h2>
                        <span className="text-caption text-text-secondary">
                            {t('appeals.admin.by_link')}
                        </span>
                    </div>
                    <span className="rounded-md bg-surface-muted px-2 py-0.5 text-caption font-bold">
                        {t(`appeals.admin.status.${appeal.status}`)}
                    </span>
                </div>

                <div className="flex flex-col gap-1 rounded-2xl bg-surface-muted p-4 text-meta">
                    <span className="text-caption font-bold tracking-[0.06em] text-text-secondary uppercase">
                        {t('appeals.admin.original')}
                    </span>
                    <strong>
                        {banned
                            ? t('penalties.ban')
                            : t('penalties.suspension')}
                        {penalty.until &&
                            ` · ${t('appeals.admin.until', { date: shortDate(penalty.until, locale) })}`}
                    </strong>
                    <span className="text-text-secondary">
                        {t('appeals.admin.applied', {
                            item: penalty.policyItem,
                            by: penalty.appliedBy ?? '—',
                            date: shortDate(penalty.startsAt, locale),
                        })}
                    </span>
                    <q className="text-text-secondary">{penalty.reason}</q>
                </div>

                <div className="flex flex-col gap-1 text-meta">
                    <span className="text-caption font-bold tracking-[0.06em] text-text-secondary uppercase">
                        {t('appeals.admin.from', {
                            username: user.username,
                            date: shortDate(appeal.sentAt, locale),
                        })}
                    </span>
                    <q className="text-body">{appeal.body}</q>
                </div>

                {appeal.status === 'open' ? (
                    <Form
                        {...decide.form(appeal.id)}
                        options={{ preserveScroll: true }}
                        className="flex flex-col gap-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <fieldset className="flex flex-col gap-2">
                                    <legend className="mb-2 text-label font-bold">
                                        {t('appeals.admin.decision')}
                                    </legend>
                                    {(['1', '0'] as const).map((option) => (
                                        <label
                                            key={option}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3',
                                                decision === option
                                                    ? 'border-primary bg-surface-selected/50'
                                                    : 'border-border-strong hover:bg-surface-hover',
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="accepted"
                                                value={option}
                                                checked={decision === option}
                                                onChange={() =>
                                                    setDecision(option)
                                                }
                                                className="size-4 accent-primary"
                                            />
                                            <span className="text-label font-bold">
                                                {option === '1'
                                                    ? t('appeals.admin.accept')
                                                    : t('appeals.admin.reject')}
                                            </span>
                                        </label>
                                    ))}
                                </fieldset>
                                <FormField
                                    id={`${titleId}-justificativa`}
                                    label={t('appeals.admin.justification')}
                                    error={errors.reason}
                                    hint={t('appeals.admin.justification_hint')}
                                >
                                    {(field) => (
                                        <Textarea
                                            {...field}
                                            name="reason"
                                            rows={3}
                                            maxLength={2000}
                                        />
                                    )}
                                </FormField>
                                {decision === '1' && (
                                    <p className="rounded-2xl bg-success-bg px-3.5 py-3 text-meta text-success-on-bg">
                                        {banned
                                            ? t(
                                                  'appeals.admin.accept_effect_ban',
                                                  { username: user.username },
                                              )
                                            : t('appeals.admin.accept_effect', {
                                                  username: user.username,
                                              })}
                                    </p>
                                )}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        size="md"
                                        disabled={
                                            processing || decision === null
                                        }
                                    >
                                        {processing && <Spinner />}
                                        {decision === '0'
                                            ? t('appeals.admin.submit_reject')
                                            : t('appeals.admin.submit_accept')}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                ) : (
                    <p className="text-meta">
                        <strong>
                            {t(`appeals.admin.status.${appeal.status}`)}
                        </strong>
                        {appeal.decidedBy && ` · ${appeal.decidedBy}`}
                        {appeal.decidedAt &&
                            ` · ${shortDate(appeal.decidedAt, locale)}`}
                        {appeal.decisionReason && (
                            <q className="mt-1 block text-text-secondary">
                                {appeal.decisionReason}
                            </q>
                        )}
                    </p>
                )}
            </section>
        </li>
    );
}
