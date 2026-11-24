import { Link, router, usePage } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import {
    NotificationIcon,
    NotificationText,
} from '@/components/notifications/notification-content';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as notifications from '@/routes/notifications';

/** Acima disso, o selo mostra "9+". */
const BADGE_MAX = 9;

/**
 * O sino do cabeçalho (prancha "Menu do sino"): a contagem de não lidas e
 * as últimas notificações. Abrir o menu não marca nada como lido (RF-188).
 */
export default function NotificationBell({
    className,
}: {
    className?: string;
}) {
    const { t } = useTranslation();
    const shared = usePage().props.notifications;

    if (!shared) {
        return null;
    }

    const { unread, latest } = shared;
    const label =
        unread === 0
            ? t('notifications.title')
            : unread === 1
              ? t('notifications.bell_one')
              : t('notifications.bell', { count: unread });

    return (
        // Não modal: o resto da página não fica escondido com foco dentro
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    aria-label={label}
                    className={cn(
                        'relative size-10 rounded-full px-0',
                        className,
                    )}
                >
                    <Bell aria-hidden="true" className="size-5" />
                    {unread > 0 && (
                        <span
                            aria-hidden="true"
                            className="absolute top-1 right-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.25 text-[0.6875rem] font-bold text-text-on-primary"
                        >
                            {unread > BADGE_MAX ? `${BADGE_MAX}+` : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[min(24rem,calc(100vw-2rem))] p-2"
            >
                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                    <span className="font-display text-base font-extrabold">
                        {t('notifications.title')}
                    </span>
                    {unread > 0 && (
                        <DropdownMenuItem
                            onSelect={() =>
                                router.patch(
                                    notifications.readAll().url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            className="h-8 gap-1.5 px-2 text-caption font-bold text-primary-text"
                        >
                            <CheckCheck aria-hidden="true" className="size-4" />
                            {t('notifications.mark_all')}
                        </DropdownMenuItem>
                    )}
                </div>
                {latest.length === 0 ? (
                    <p className="px-2 py-4 text-meta text-text-secondary">
                        {t('notifications.empty.title')}
                    </p>
                ) : (
                    latest.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            asChild
                            className="items-start gap-3 rounded-xl px-2 py-2.5"
                        >
                            <Link href={item.href}>
                                <NotificationIcon
                                    type={item.type}
                                    className="size-9"
                                />
                                <span className="min-w-0 flex-1 text-meta leading-snug whitespace-normal">
                                    {!item.read && (
                                        <>
                                            <span className="sr-only">
                                                {t('notifications.unread')}
                                            </span>{' '}
                                        </>
                                    )}
                                    <NotificationText item={item} />
                                </span>
                                {!item.read && (
                                    <span
                                        aria-hidden="true"
                                        className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                                    />
                                )}
                            </Link>
                        </DropdownMenuItem>
                    ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center font-bold">
                    <Link href={notifications.index().url}>
                        {t('notifications.see_all')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
