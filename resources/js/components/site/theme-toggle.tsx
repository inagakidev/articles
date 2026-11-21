import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { revealFrom } from '@/lib/view-transition';

export const themes: { value: Appearance; key: TranslationKey }[] = [
    { value: 'system', key: 'theme.system' },
    { value: 'light', key: 'theme.light' },
    { value: 'dark', key: 'theme.dark' },
];

const icons = { system: Monitor, light: Sun, dark: Moon };

/** Botão do cabeçalho: alterna entre dispositivo, claro e escuro. */
export function ThemeToggle({ className }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useTranslation();
    const current = themes.findIndex((theme) => theme.value === appearance);
    const next = themes[(current + 1) % themes.length];
    const Icon = icons[appearance];

    return (
        <Button
            type="button"
            variant="ghost"
            className={className}
            size="icon"
            aria-label={t('theme.toggle', {
                current: t(themes[current].key).toLowerCase(),
                next: t(next.key).toLowerCase(),
            })}
            onClick={(event) =>
                revealFrom(event.currentTarget, () =>
                    updateAppearance(next.value),
                )
            }
        >
            <Icon
                key={appearance}
                aria-hidden="true"
                className="size-5 animate-icon-swap"
            />
        </Button>
    );
}

/** Lista do rodapé, com as três opções visíveis. */
export function ThemeSelect() {
    const { appearance, updateAppearance } = useAppearance();
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor="tema" className="text-caption font-bold">
                {t('theme.label')}
            </label>
            <select
                id="tema"
                value={appearance}
                onChange={(event) => {
                    const value = event.target.value as Appearance;
                    revealFrom(event.target, () => updateAppearance(value));
                }}
                className="h-10 rounded-md border border-border-strong bg-surface px-3 text-meta text-text-primary"
            >
                {themes.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                        {t(theme.key)}
                    </option>
                ))}
            </select>
        </div>
    );
}
