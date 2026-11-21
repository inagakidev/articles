import { Head, usePage } from '@inertiajs/react';
import { CircleCheck, Info, Users } from 'lucide-react';
import MetricCard from '@/components/admin/metric-card';
import EmptyState from '@/components/ui/empty-state';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

type Props = {
    metrics: { users: number };
    /** Avisos para a administradora; chegam com moderação, denúncias e contestações. */
    attention: unknown[];
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
 * Painel da administração (prancha "Admin · Painel"). Por enquanto só com o
 * que já existe (D75); as outras métricas e os avisos entram com as fatias.
 */
export default function Dashboard({ metrics, attention, updatedAt }: Props) {
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
                {attention.length === 0 && (
                    <EmptyState
                        Icon={CircleCheck}
                        title={t('admin.dashboard.attention.empty.title')}
                        text={t('admin.dashboard.attention.empty.text')}
                    />
                )}
            </section>

            <p className="flex items-center gap-2 text-meta text-text-secondary">
                <Info aria-hidden="true" className="size-4" />
                {t('admin.dashboard.later')}
            </p>
        </>
    );
}
