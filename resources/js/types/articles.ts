/**
 * Formato dos artigos, categorias e autores mostrados nas páginas públicas.
 * A página de apresentação já espera estes dados; quem os envia são as
 * fatias de categorias e de leitura pública (D74).
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
    /** Dia da publicação da versão atual (AAAA-MM-DD). */
    publishedAt: string;
    readingMinutes: number;
};
