import type { Locale } from '@/lib/i18n';

/**
 * Data de calendário (AAAA-MM-DD) no idioma da página. O fuso fica em UTC
 * para a data não andar um dia conforme o fuso de quem lê.
 */
export function formatDate(
    locale: Locale,
    isoDate: string,
    style: 'long' | 'medium' = 'long',
): string {
    return new Intl.DateTimeFormat(locale.replace('_', '-'), {
        dateStyle: style,
        timeZone: 'UTC',
    }).format(new Date(`${isoDate}T00:00:00Z`));
}
