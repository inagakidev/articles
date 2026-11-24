/** Uma notificação como o servidor entrega (`NotificationItem`, D90). */
export type NotificationItem = {
    id: string;
    type:
        | 'article.approved'
        | 'article.rejected'
        | 'article.unpublished'
        | 'article.deleted'
        | 'comment.posted'
        | 'comment.replied'
        | 'like.received';
    read: boolean;
    at: string | null;
    /** Abre o destino e marca como lida. */
    href: string;
    title: string | null;
    edit: boolean;
    policyItem: string | null;
    actor: { name: string; username: string } | null;
    excerpt: string | null;
    /** Curtidas: o que foi curtido e quantas pessoas, nunca quem. */
    target: 'article' | 'comment' | null;
    count: number | null;
};

/** O sino do cabeçalho: não lidas e as últimas. */
export type SharedNotifications = {
    unread: number;
    latest: NotificationItem[];
};
