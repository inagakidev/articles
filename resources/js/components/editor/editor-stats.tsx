import { useTranslation } from '@/lib/i18n';

/** Palavras, tempo de leitura e caracteres com o limite (RF-070, RF-078, RF-096). */
export default function EditorStats({
    words,
    characters,
    maxCharacters,
    wordsPerMinute,
}: {
    words: number;
    characters: number;
    maxCharacters: number;
    wordsPerMinute: number;
}) {
    const { t, locale } = useTranslation();
    const format = new Intl.NumberFormat(locale.replace('_', '-'), {
        notation: 'compact',
        maximumFractionDigits: 1,
    });
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    const near = characters > maxCharacters * 0.9;

    return (
        <section aria-labelledby="stats-title">
            <h2 id="stats-title" className="sr-only">
                {t('editor.stats.title')}
            </h2>
            <dl className="grid grid-cols-3 gap-2 text-center">
                <Stat
                    label={t('editor.stats.words')}
                    value={words.toLocaleString(locale.replace('_', '-'))}
                />
                <Stat
                    label={t('editor.stats.reading')}
                    value={t('editor.stats.reading_value', { minutes })}
                />
                <Stat
                    label={t('editor.stats.characters')}
                    value={format.format(characters)}
                    hint={t('editor.stats.characters_limit', {
                        max: format.format(maxCharacters),
                    })}
                    warn={near}
                />
            </dl>
        </section>
    );
}

function Stat({
    label,
    value,
    hint,
    warn,
}: {
    label: string;
    value: string;
    hint?: string;
    warn?: boolean;
}) {
    return (
        <div className="flex flex-col gap-0.5 rounded-inner bg-surface-muted px-2 py-3">
            <dt className="text-caption font-bold text-text-secondary">
                {label}
            </dt>
            <dd
                className={
                    warn
                        ? 'font-display text-h3 font-extrabold text-warning-fg'
                        : 'font-display text-h3 font-extrabold'
                }
            >
                {value}
            </dd>
            {hint && <dd className="text-badge text-text-secondary">{hint}</dd>}
        </div>
    );
}
