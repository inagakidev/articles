import { usePage } from '@inertiajs/react';
import en from '../../../lang/en.json';
import ptBR from '../../../lang/pt_BR.json';

/**
 * Traduções da interface. Os mesmos arquivos de lang/ são usados pelo
 * Laravel, então frontend e backend têm uma única fonte de textos.
 */
export type TranslationKey = keyof typeof ptBR;
export type Locale = 'pt_BR' | 'en';

// Tipar o inglês com as chaves do português faz uma tradução faltando virar erro de compilação.
const messages: Record<Locale, Record<TranslationKey, string>> = {
    pt_BR: ptBR,
    en,
};

export const locales: Locale[] = ['pt_BR', 'en'];

/** Nome de cada idioma nele mesmo, como é costume em seletores de idioma. */
export const localeNames: Record<Locale, { name: string; code: string }> = {
    pt_BR: { name: 'Português', code: 'PT' },
    en: { name: 'English', code: 'EN' },
};

type Replacements = Record<string, string | number>;

/** Substitui :nome pelos valores, como o __() do Laravel. */
export function translate(
    locale: Locale,
    key: TranslationKey,
    replacements: Replacements = {},
): string {
    const text = messages[locale]?.[key] ?? messages.pt_BR[key];

    return Object.entries(replacements).reduce(
        (result, [name, value]) => result.replaceAll(`:${name}`, String(value)),
        text,
    );
}

export function useTranslation() {
    const { locale } = usePage().props;

    return {
        locale: locale,
        t: (key: TranslationKey, replacements?: Replacements) =>
            translate(locale, key, replacements),
    };
}
