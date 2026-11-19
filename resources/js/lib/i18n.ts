import { usePage } from '@inertiajs/react';
import en from '../../../lang/en.json';
import ptBR from '../../../lang/pt_BR.json';

/**
 * Traduções da interface. Os mesmos arquivos de lang/ são usados pelo
 * Laravel, então frontend e backend têm uma única fonte de textos.
 */
export type ChaveDeTraducao = keyof typeof ptBR;
export type Idioma = 'pt_BR' | 'en';

// Tipar o inglês com as chaves do português faz uma tradução faltando virar erro de compilação.
const mensagens: Record<Idioma, Record<ChaveDeTraducao, string>> = {
    pt_BR: ptBR,
    en,
};

export const idiomas: Idioma[] = ['pt_BR', 'en'];

/** Nome de cada idioma nele mesmo, como é costume em seletores de idioma. */
export const nomesDosIdiomas: Record<Idioma, { nome: string; sigla: string }> =
    {
        pt_BR: { nome: 'Português', sigla: 'PT' },
        en: { nome: 'English', sigla: 'EN' },
    };

type Valores = Record<string, string | number>;

/** Substitui :nome pelos valores, como o __() do Laravel. */
export function traduzir(
    idioma: Idioma,
    chave: ChaveDeTraducao,
    valores: Valores = {},
): string {
    const texto = mensagens[idioma]?.[chave] ?? mensagens.pt_BR[chave];

    return Object.entries(valores).reduce(
        (resultado, [nome, valor]) =>
            resultado.replaceAll(`:${nome}`, String(valor)),
        texto,
    );
}

export function useTraducao() {
    const { locale } = usePage().props;

    return {
        idioma: locale,
        t: (chave: ChaveDeTraducao, valores?: Valores) =>
            traduzir(locale, chave, valores),
    };
}
