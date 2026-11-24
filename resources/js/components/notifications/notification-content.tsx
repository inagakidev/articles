import {
    AlertCircle,
    CheckCircle2,
    EyeOff,
    Heart,
    MessageCircle,
    Reply,
    Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NotificationItem } from '@/components/notifications/types';
import { pastelTones } from '@/components/ui/pill';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { PastelTone } from '@/types';

/** Títulos longos encurtam no aviso, como na prancha. */
const TITLE = 40;

const looks: Record<NotificationItem['type'], [LucideIcon, PastelTone]> = {
    'article.approved': [CheckCircle2, 'mint'],
    'article.rejected': [AlertCircle, 'peach'],
    'article.unpublished': [EyeOff, 'peach'],
    'article.deleted': [Trash2, 'pink'],
    'comment.posted': [MessageCircle, 'blue'],
    'comment.replied': [Reply, 'lilac'],
    'like.received': [Heart, 'pink'],
};

function short(title: string | null): string {
    const text = title ?? '';

    return text.length > TITLE ? `${text.slice(0, TITLE).trimEnd()}…` : text;
}

/** O ícone de cada tipo, num quadrado pastel. */
export function NotificationIcon({
    type,
    className,
}: {
    type: NotificationItem['type'];
    className?: string;
}) {
    const [Icon, tone] = looks[type];

    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
                pastelTones[tone],
                className,
            )}
        >
            <Icon className="size-5" />
        </span>
    );
}

/**
 * O texto de uma notificação no idioma de quem lê: o começo em negrito e
 * o resto em seguida ("**Caio Lima comentou** em “Modais…”: “O foco…”").
 */
export function NotificationText({ item }: { item: NotificationItem }) {
    const { t } = useTranslation();
    const title = short(item.title);
    const name = item.actor?.name ?? '';
    const item_ = item.policyItem ?? '';

    const [lead, rest] = ((): [string, string] => {
        switch (item.type) {
            case 'article.approved':
                return item.edit
                    ? [
                          t('notifications.approved_edit.lead'),
                          t('notifications.approved_edit.rest', { title }),
                      ]
                    : [
                          t('notifications.approved.lead'),
                          t('notifications.approved.rest', { title }),
                      ];
            case 'article.rejected':
                return [
                    t(
                        item.edit
                            ? 'notifications.rejected_edit.lead'
                            : 'notifications.rejected.lead',
                    ),
                    t('notifications.rejected.rest', { title, item: item_ }),
                ];
            case 'article.unpublished':
                return [
                    t('notifications.unpublished.lead'),
                    t('notifications.unpublished.rest', {
                        title,
                        item: item_,
                    }),
                ];
            case 'article.deleted':
                return [
                    t('notifications.deleted.lead'),
                    t('notifications.deleted.rest', { title, item: item_ }),
                ];
            case 'comment.posted':
                return [
                    t('notifications.commented.lead', { name }),
                    t('notifications.commented.rest', {
                        title,
                        excerpt: item.excerpt ?? '',
                    }),
                ];
            case 'comment.replied':
                return [
                    t('notifications.replied.lead', { name }),
                    t('notifications.replied.rest', {
                        title,
                        excerpt: item.excerpt ?? '',
                    }),
                ];
            case 'like.received':
                return [
                    item.count === 1
                        ? t('notifications.liked.lead_one')
                        : t('notifications.liked.lead', {
                              count: item.count ?? 0,
                          }),
                    t(
                        item.target === 'comment'
                            ? 'notifications.liked.comment'
                            : 'notifications.liked.article',
                        { title },
                    ),
                ];
        }
    })();

    return (
        <>
            <strong>{lead}</strong> {rest}
        </>
    );
}
