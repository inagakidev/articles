import { Head, Link, usePage } from '@inertiajs/react';
import {
    CircleCheck,
    Clock,
    FileText,
    Flag,
    Hourglass,
    Info,
    Users,
} from 'lucide-react';
import MetricCard from '@/components/admin/metric-card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { review } from '@/routes/admin';

/** Uma versão que passou do prazo da fila (RF-378). */
type LateVersion = {
    type: 'late_version';
    id: number;
    title: string | null;
    author: string | null;
    hours: number;
};

type Props = {
    metrics: {
        users: number;
        published: number;
        pending: number;
        reports: number;
    };
    /** Avisos para a administradora; denúncias e contestações chegam com as fatias 20 e 21. */
    attention: LateVersion[];
    lateHours: number;
    /** Quando os números foram lidos (ISO). */
    updatedAt: string;
};

/** Saudação pela hora de quem está vendo. */
function greetingKey(hour: number): TranslationKey {
    if (hour < 12) {
        return 'admin.dashboard.greeting.morning';
    }

    return hour < 18
        ? 'admin.dashboard.greeting.afternoon'
        : 'admin.dashboard.greeting.evening';
}

/**
 * Painel da administração (prancha "Admin · Painel", RF-262): usuários,
 * artigos publicados, a fila e as versões atrasadas. Denúncias e
 * contestações entram com as fatias 20 e 21 (D75).
 */
export default function Dashboard({
    metrics,
    attention,
    lateHours,
    updatedAt,
}: Props) {
    const { auth } = usePage().props;
    const { t, locale } = useTranslation();
    const updated = new Date(updatedAt);
    const firstName = (auth.user?.name ?? '').split(' ')[0];
    const time = new Intl.DateTimeFormat(locale.replace('_', '-'), {
        hour: '2-digit',
        minute: '2-digit',
    }).format(updated);

    return (
        <>
            <Head title={t('admin.dashboard.title')} />

            <div>
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                    {t(greetingKey(new Date().getHours()), { name: firstName })}
                </h1>
                <p className="mt-1.5 text-label text-text-secondary">
                    {t('admin.dashboard.updated', { time })}
                </p>
            </div>

            <section aria-label={t('admin.dashboard.metrics')}>
                <dl className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                    <MetricCard
                        Icon={Users}
                        title={t('admin.dashboard.users.title')}
                        value={metrics.users}
                        hint={t('admin.dashboard.users.hint')}
                    />
                    <MetricCard
                        Icon={FileText}
                        title={t('admin.dashboard.published.title')}
                        value={metrics.published}
                        hint={t('admin.dashboard.published.hint')}
                    />
                    <MetricCard
                        Icon={Hourglass}
                        title={t('admin.dashboard.pending.title')}
                        value={metrics.pending}
                        hint={t('admin.dashboard.pending.hint')}
                    />
                    <MetricCard
                        Icon={Flag}
                        title={t('admin.dashboard.reports.title')}
                        value={metrics.reports}
                        hint={t('admin.dashboard.reports.hint')}
                    />
                </dl>
            </section>

            <section
                aria-labelledby="attention-title"
                className="rounded-card border border-border bg-surface p-6"
            >
                <h2
                    id="attention-title"
                    className="mb-3.5 font-display text-[1.125rem] font-extrabold"
                >
                    {t('admin.dashboard.attention.title')}
                </h2>
                {attention.length === 0 ? (
                    <EmptyState
                        Icon={CircleCheck}
                        title={t('admin.dashboard.attention.empty.title')}
                        text={t('admin.dashboard.attention.empty.text')}
                    />
                ) : (
                    <ul className="flex flex-col divide-y divide-border">
                        {attention.map((item) => (
                            <li
                                key={item.id}
                                className="flex flex-wrap items-center gap-3 py-3"
                            >
                                <span
                                    aria-hidden="true"
                                    className="inline-flex size-9 items-center justify-center rounded-full bg-warning-bg text-warning-fg"
                                >
                                    <Clock className="size-4" />
                                </span>
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <strong className="text-label">
                                        {t('admin.dashboard.attention.late', {
                                            hours: lateHours,
                                        })}
                                    </strong>
                                    <span className="text-meta text-text-secondary">
                                        {t(
                                            'admin.dashboard.attention.late_text',
                                            {
                                                title:
                                                    item.title ??
                                                    t('preview.untitled'),
                                                author: item.author ?? '—',
                                                hours: item.hours,
                                            },
                                        )}
                                    </span>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={review(item.id)}>
                                        {t('admin.queue.review_action')}
                                    </Link>
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <p className="flex items-center gap-2 text-meta text-text-secondary">
                <Info aria-hidden="true" className="size-4" />
                {t('admin.dashboard.later')}
            </p>
        </>
    );
}
