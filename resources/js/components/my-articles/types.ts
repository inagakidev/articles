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
    hasDraft: boolean;
    pendingSubmittedAt: string | null;
    firstPublishedAt?: string | null;
    currentSince?: string | null;
    editRejected?: boolean;
};

export type MySections = {
    drafts: MyArticle[];
    review: MyArticle[];
    rejected: MyArticle[];
    published: MyArticle[];
};
