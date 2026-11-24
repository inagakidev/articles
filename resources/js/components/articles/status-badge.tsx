import { CircleCheck, Clock, PenLine } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Estados de um artigo, com a cor e o ícone de cada um (DESIGN §2.7). */
const statuses = {
    draft: {
        label: 'article.status.draft',
        Icon: PenLine,
        className:
            'bg-surface-muted text-text-on-selected ring-1 ring-inset ring-pastel-lavender dark:ring-0',
    },
    review: {
        label: 'article.status.review',
        Icon: Clock,
        className: 'bg-tint-warning-bg text-tint-warning-fg',
    },
    published: {
        label: 'article.status.published',
        Icon: CircleCheck,
        className: 'bg-tint-success-bg text-tint-success-fg',
    },
} satisfies Record<string, { label: TranslationKey; [key: string]: unknown }>;

export type ArticleStatus = keyof typeof statuses;

export default function StatusBadge({
    status,
    size = 'md',
    className,
}: {
    status: ArticleStatus;
    size?: 'sm' | 'md';
    className?: string;
}) {
    const { t } = useTranslation();
    const { label, Icon, className: color } = statuses[status];

    return (
        <span
            className={cn(
                'inline-flex w-fit max-w-full items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-2 leading-5 font-bold whitespace-nowrap',
                'dark:ring-1 dark:ring-current dark:ring-inset',
                size === 'md' ? 'text-meta' : 'text-badge',
                color,
                className,
            )}
        >
            <Icon aria-hidden="true" className="size-3.5" />
            {t(label)}
        </span>
    );
}
