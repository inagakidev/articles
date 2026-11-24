import { Link, router } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';
import {
    NotificationIcon,
    NotificationText,
} from '@/components/notifications/notification-content';
import type { NotificationItem } from '@/components/notifications/types';
import { isToday, shortDate, time } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as notifications from '@/routes/notifications';

const tap =
    'inline-flex size-10 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary';

/**
 * Uma notificação na lista (prancha "Notificações"): o ponto de não lida,
 * o ícone, o texto que leva ao destino e, ao lado, marcar como lida e
 * excluir (RF-189, RF-190).
 */
export default function NotificationRow({ item }: { item: NotificationItem }) {
    const { t, locale } = useTranslation();
    const options = { preserveScroll: true };

    return (
        <li
            className={cn(
                'flex items-start gap-3.5 rounded-2xl border border-transparent px-5 py-4 max-sm:px-3',
                !item.read && 'bg-surface-selected/40',
            )}
        >
            {item.read ? (
                <span aria-hidden="true" className="w-2.5 shrink-0" />
            ) : (
                <span
                    aria-hidden="true"
                    className="mt-2 size-2.5 shrink-0 rounded-full bg-primary"
                />
            )}
            <NotificationIcon type={item.type} />
            <Link
                href={item.href}
                className="flex min-w-0 flex-1 flex-col gap-1 hover:[&>span:first-of-type]:underline"
            >
                <span className="text-[0.9375rem] leading-[1.45]">
                    {!item.read && (
                        <>
                            <span className="sr-only">
                                {t('notifications.unread')}
                            </span>{' '}
                        </>
                    )}
                    <NotificationText item={item} />
                </span>
                {item.at && (
                    <time
                        dateTime={item.at}
                        className="text-caption text-text-secondary"
                    >
                        {isToday(item.at)
                            ? time(item.at, locale)
                            : `${shortDate(item.at, locale)}, ${time(item.at, locale)}`}
                    </time>
                )}
            </Link>
            <div className="flex shrink-0 gap-1">
                {!item.read && (
                    <button
                        type="button"
                        aria-label={t('notifications.mark_read')}
                        title={t('notifications.mark_read')}
                        onClick={() =>
                            router.patch(
                                notifications.read(item.id).url,
                                {},
                                options,
                            )
                        }
                        className={tap}
                    >
                        <Check aria-hidden="true" className="size-5" />
                    </button>
                )}
                <button
                    type="button"
                    aria-label={t('notifications.delete')}
                    title={t('notifications.delete')}
                    onClick={() =>
                        router.delete(
                            notifications.destroy(item.id).url,
                            options,
                        )
                    }
                    className={tap}
                >
                    <Trash2 aria-hidden="true" className="size-5" />
                </button>
            </div>
        </li>
    );
}
