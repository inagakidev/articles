import { Form, Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import DecisionFields from '@/components/moderation/decision-fields';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as reportRoutes from '@/routes/admin/reports';
import PersonLine from '@/components/reports/person-line';
import type { Outcome, Selected } from '@/components/reports/types';
/** A análise: o conteúdo como está agora, os motivos e a decisão. */
export default function ReportAnalysis({
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
