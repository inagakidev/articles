/** Uma linha de Meus artigos, como vem de `AuthorArticles`. */
export type MyArticle = {
    id: number;
    versionId?: number;
    title: string | null;
    words: number;
    updatedAt: string | null;
    submittedAt?: string | null;
    decidedAt?: string | null;
    reason?: string | null;
    /** Item da Política de conteúdo citado na rejeição (RF-107). */
    policyItem?: string | null;
    hasDraft: boolean;
    pendingSubmittedAt: string | null;
    /** Endereço público do publicado (D83). */
    url?: string | null;
    firstPublishedAt?: string | null;
    /** Curtidas do publicado (D88). */
    likes?: number;
    currentSince?: string | null;
    editRejected?: boolean;
};

export type MySections = {
    drafts: MyArticle[];
    review: MyArticle[];
    rejected: MyArticle[];
    published: MyArticle[];
};
