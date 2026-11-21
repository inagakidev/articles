import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/lib/i18n';
import { locales, localeNames, useTranslation } from '@/lib/i18n';
import { canAnimateTransition, markTransition } from '@/lib/view-transition';
import { update } from '@/routes/locale';

/** O texto troca com um esmaecer suave da página (View Transitions, D74). */
function changeLocale(locale: Locale) {
    router.put(
        update().url,
        { locale },
        {
            preserveScroll: true,
            viewTransition: canAnimateTransition()
                ? (transition) => markTransition('vt-locale', transition)
                : false,
        },
    );
}

/** Botão do cabeçalho: alterna entre os dois idiomas. */
export function LanguageToggle({ className }: { className?: string }) {
    const { locale, t } = useTranslation();
    const next = locales[(locales.indexOf(locale) + 1) % locales.length];

    return (
        <Button
            type="button"
            variant="ghost"
            className={className}
            aria-label={t('language.toggle', {
                current: localeNames[locale].name,
                next: localeNames[next].name,
            })}
            onClick={() => changeLocale(next)}
        >
            <span key={locale} className="animate-icon-swap">
                {localeNames[locale].code}
            </span>
        </Button>
    );
}

/** Lista do rodapé, com os idiomas pelo nome. */
export function LanguageSelect() {
    const { locale, t } = useTranslation();

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="idioma" className="text-caption font-bold">
                {t('language.label')}
            </label>
            <select
                id="idioma"
                value={locale}
                onChange={(event) => changeLocale(event.target.value as Locale)}
                className="h-10 rounded-full border border-border-strong bg-surface px-3 text-meta text-text-primary"
            >
                {locales.map((option) => (
                    <option
                        key={option}
                        value={option}
                        lang={option.replace('_', '-')}
                    >
                        {localeNames[option].name}
                    </option>
                ))}
            </select>
        </div>
    );
}
