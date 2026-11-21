import type { PastelTone } from '@/types';

export type AdminCategory = {
    id: number;
    namePtBr: string;
    nameEn: string;
    color: PastelTone;
    articles: number;
};

export type AdminTag = {
    id: number;
    name: string;
    articles: number;
    blocked: boolean;
    /** Tag parecida e mais usada, sugerida para a união (D79). */
    mergeInto: { id: number; name: string } | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    total: number;
};
