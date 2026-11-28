/** Tipos e regras comuns aos comentários da leitura (D88). */
import { relative, shortDate } from '@/lib/dates';
import type { Locale } from '@/lib/i18n';

export type CommentNode = {
    id: number;
    body: string;
    depth: number;
    createdAt: string | null;
    edited: boolean;
    author: { name: string; username: string; avatar: string | null };
    isArticleAuthor: boolean;
    own: boolean;
    likes: { count: number; liked: boolean };
    can: {
        like: boolean;
        reply: boolean;
        edit: boolean;
        delete: boolean;
        moderate: boolean;
        report: boolean;
    };
    /** Quem lê já denunciou e a denúncia está em análise (RF-167). */
    reported: boolean;
    replies: CommentNode[];
};

export type CommentsData = {
    total: number;
    items: CommentNode[];
    /** Página da conversa, de 5 comentários de primeiro nível cada (D88). */
    page: number;
    lastPage: number;
    canComment: boolean;
    maxLength: number;
};

/** As props que a leitura recarrega depois de mexer nos comentários. */
export const RELOAD = ['comments'];

/** A árvore em ordem de leitura, cada um com o próprio nível. */
export function flatten(nodes: CommentNode[]): CommentNode[] {
    return nodes.flatMap((node) => [node, ...flatten(node.replies)]);
}

/** A partir de quanto do limite o contador aparece. */
export const COUNTER_FROM = 0.9;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** "agora", "há 5 minutos", "ontem"; depois de uma semana, "14 nov". */
export function when(iso: string, locale: Locale): string {
    return Date.now() - new Date(iso).getTime() < WEEK_MS
        ? relative(iso, locale)
        : shortDate(iso, locale);
}
