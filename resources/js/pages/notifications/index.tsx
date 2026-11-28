import { Head, Link, router } from '@inertiajs/react';
import { CheckCheck, Trash2 } from 'lucide-react';
import NotificationRow from '@/components/notifications/notification-row';
import type { NotificationItem } from '@/components/notifications/types';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import MascotStage from '@/components/ui/mascot-stage';
import Pagination from '@/components/ui/pagination';
import { isToday } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { mine } from '@/routes/articles';
import SegmentedNav from '@/components/ui/segmented-nav';
import * as notifications from '@/routes/notifications';

type Filter = 'todas' | 'nao-lidas';

type Props = {
    filter: Filter;
    unread: number;
    list: {
        data: NotificationItem[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
    retentionDays: number;
};

function pageUrl(filter: Filter, page = 1): string {
    const query: Record<string, string | number> = {};

    if (filter !== 'todas') query.filtro = filter;
    if (page > 1) query.page = page;

    return notifications.index({ query }).url;
}

function isYesterday(iso: string): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return new Date(iso).toDateString() === yesterday.toDateString();
}

/** Hoje, ontem e o resto, na ordem em que chegaram. */
function groups(items: NotificationItem[]) {
    const sections: { key: TranslationKey; items: NotificationItem[] }[] = [
        { key: 'notifications.groups.today', items: [] },
        { key: 'notifications.groups.yesterday', items: [] },
        { key: 'notifications.groups.older', items: [] },
    ];

    for (const item of items) {
        const index =
            item.at && isToday(item.at)
                ? 0
                : item.at && isYesterday(item.at)
                  ? 1
                  : 2;
        sections[index].items.push(item);
    }

    return sections.filter((section) => section.items.length > 0);
}

const ripples = [210, 270, 330];

/**
 * Notificações (pranchas "Notificações" e "Notificações vazias", RF-179 a
 * RF-192): todas ou só as não lidas, por dia, com marcar e excluir. Abrir
 * a página não marca nada como lido (RF-188).
 */
export default function Notifications({
    filter,
    unread,
    list: page,
    retentionDays,
}: Props) {
    const { t } = useTranslation();
    const options = { preserveScroll: true };
    const hasRead = filter === 'todas' && page.total > unread;

    return (
        <>
            <Head title={t('notifications.title')} />

            <div className="mx-auto flex w-full max-w-205 flex-col gap-6 px-4 pt-10 pb-24 sm:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <h1 className="font-display text-[1.75rem]/9 font-extrabold tracking-[-0.02em] sm:text-[2.25rem]/11">
                        {t('notifications.title')}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        {unread > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.patch(
                                        notifications.readAll().url,
                                        {},
                                        options,
                                    )
                                }
                            >
                                <CheckCheck aria-hidden="true" />
                                {t('notifications.mark_all')}
                            </Button>
                        )}
                        {hasRead && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.delete(
                                        notifications.clearRead().url,
                                        options,
                                    )
                                }
                            >
                                <Trash2 aria-hidden="true" />
                                {t('notifications.clear_read')}
                            </Button>
                        )}
                    </div>
                </div>

                <SegmentedNav
                    label={t('notifications.filter')}

                    current={filter}

                    preserveScroll

                    items={[
                        {
                            key: 'todas',
                            href: pageUrl('todas'),
                            label: t('notifications.all'),
                        },

                        {
                            key: 'nao-lidas',

                            href: pageUrl('nao-lidas'),

                            label:
                                unread > 0
                                    ? t('notifications.unread_tab', {
                                          count: unread,
                                      })
                                    : t('notifications.unread_tab_empty'),
                        },
                    ]}
                />

                {page.total === 0 ? (
                    <Empty filtered={filter === 'nao-lidas'} />
                ) : (
                    <>
                        <div className="flex flex-col gap-4 rounded-section border border-border bg-surface p-4 max-sm:p-2">
                            {groups(page.data).map((section, index) => (
                                <section
                                    key={section.key}
                                    aria-labelledby={`grupo-${index}`}
                                    className="flex flex-col gap-2"
                                >
                                    <h2
                                        id={`grupo-${index}`}
                                        className="px-2 pt-1 text-caption font-bold tracking-[0.06em] text-text-secondary uppercase"
                                    >
                                        {t(section.key)}
                                    </h2>
                                    <ul className="flex flex-col gap-1">
                                        {section.items.map((item) => (
                                            <NotificationRow
                                                key={item.id}
                                                item={item}
                                            />
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                        <Pagination
                            current={page.currentPage}
                            last={page.lastPage}
                            href={(number) => pageUrl(filter, number)}
                        />
                    </>
                )}

                <p className="text-center text-meta text-text-secondary">
                    {t('notifications.retention', { days: retentionDays })}
                </p>
            </div>
        </>
    );
}

/** Nada por aqui (prancha "Notificações vazias"). */
function Empty({ filtered }: { filtered: boolean }) {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col items-center gap-3.5 px-2 py-8 text-center">
            <MascotStage ripples={ripples} className="p-6">
                <Mascot art="dormindo" size={180} float className="relative" />
            </MascotStage>
            <strong className="font-display text-[1.375rem] font-extrabold">
                {t(
                    filtered
                        ? 'notifications.empty.unread_title'
                        : 'notifications.empty.title',
                )}
            </strong>
            <p className="max-w-md text-[0.9375rem] leading-[1.45] text-text-secondary">
                {t('notifications.empty.text')}
            </p>
            <Button asChild size="md">
                <Link href={mine().url}>{t('notifications.empty.action')}</Link>
            </Button>
        </section>
    );
}
