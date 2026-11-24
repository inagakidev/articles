/**
 * Formato dos artigos, categorias e autores mostrados nas páginas públicas.
 * Os artigos saem sempre da regra única de visibilidade (`PublicArticles`).
 */

/** Pastéis fixos do DESIGN §2.7, pelo nome guardado na categoria. */
export type PastelTone =
    | 'lavender'
    | 'lilac'
    | 'mint'
    | 'yellow'
    | 'pink'
    | 'blue'
    | 'peach';

export type CategorySummary = {
    name: string;
    color: PastelTone;
};

/** Só o perfil público (RF-382): nome e foto. */
export type AuthorSummary = {
    name: string;
    avatar: string | null;
};

export type ArticleSummary = {
    url: string;
    title: string;
    excerpt: string;
    cover: string | null;
    category: CategorySummary | null;
    author: AuthorSummary;
    /** Dia da primeira publicação (AAAA-MM-DD, RF-136). */
    publishedAt: string;
    readingMinutes: number;
};

export type TocItem = { id: string; text: string; level: number };

/** O artigo montado para ler, igual na prévia e na leitura (`ArticlePage`). */
export type ReadableArticle = {
    title: string | null;
    language: string | null;
    category: (CategorySummary & { slug: string }) | null;
    tags: string[];
    cover: {
        src: string;
        srcset: string;
        width: number;
        height: number;
        alt: string;
    } | null;
    html: string;
    toc: TocItem[];
    readingMinutes: number;
    author: {
        name: string;
        /** Nulo quando a conta foi excluída (RF-051). */
        username: string | null;
        bio: string | null;
        avatar: string | null;
    };
};
