import type { Locale } from '@/lib/i18n';

const tag = (locale: Locale) => locale.replace('_', '-');

/** "14 nov" (e o ano, se não for o atual). */
export function shortDate(iso: string, locale: Locale): string {
    const date = new Date(iso);

    return date
        .toLocaleDateString(tag(locale), {
            day: '2-digit',
            month: 'short',
            year:
                date.getFullYear() === new Date().getFullYear()
                    ? undefined
                    : 'numeric',
        })
        .replace('.', '');
}

/** "09:10". */
export function time(iso: string, locale: Locale): string {
    return new Date(iso).toLocaleTimeString(tag(locale), {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** "há 2 horas", "ontem", "há 3 dias". */
export function relative(iso: string, locale: Locale): string {
    const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
    const format = new Intl.RelativeTimeFormat(tag(locale), {
        numeric: 'auto',
    });
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
    ];

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            return format.format(Math.round(seconds / size), unit);
        }
    }

    return format.format(0, 'second');
}

export function isToday(iso: string): boolean {
    return new Date(iso).toDateString() === new Date().toDateString();
}
