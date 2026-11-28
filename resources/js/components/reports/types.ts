/** Os dados das denúncias no painel, como o servidor entrega (D91). */
export type Target = 'article' | 'comment' | 'profile';
export type Status = 'abertas' | 'procedentes' | 'improcedentes' | 'removidas';
export type TypeFilter = 'artigos' | 'comentarios' | 'perfis';
export type Outcome =
    | 'dismiss'
    | 'unpublish_article'
    | 'delete_article'
    | 'delete_comment'
    | 'moderate_profile';

export type Person = { name: string; username: string; avatar: string | null };

/** O item como está agora (`ReportedItem`); nulo se já saiu. */
export type Item = {
    title: string | null;
    text: string | null;
    author: Person | null;
    url: string | null;
    replies: number | null;
    hasPhoto?: boolean;
} | null;

export type Group = {
    target: Target;
    id: number;
    count: number;
    /** Quem escreveu tem penalidade ativa: analisar primeiro (RF-216). */
    priority: boolean;
    since: string;
    reasons: string[];
    item: Item;
};

export type Selected = {
    target: Target;
    id: number;
    item: Item;
    status: 'open' | 'upheld' | 'dismissed' | 'removed';
    reasons: Record<string, number>;
    details: string[];
    count: number;
    outcomes: Outcome[];
    decision: {
        outcome: Outcome | null;
        policyItem: string | null;
        justification: string | null;
        decidedAt: string | null;
    } | null;
};

export type Key = { target: Target; id: number } | null;
