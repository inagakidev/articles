import { Head } from '@inertiajs/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import SettingsSection from '@/components/account/settings-section';
import { changeLocale } from '@/components/site/language-switch';
import { themes } from '@/components/site/theme-toggle';
import SegmentedControl from '@/components/ui/segmented-control';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance as Theme } from '@/hooks/use-appearance';
import { locales, localeNames, useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import { revealFrom } from '@/lib/view-transition';

const icons = { system: Monitor, light: Sun, dark: Moon };

/** "Aparência e idioma": tema (RF-006, RF-007) e idioma da interface (RF-008). */
export default function Appearance() {
    const { t, locale } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();

    return (
        <>
            <Head title={t('settings.nav.appearance')} />

            <SettingsSection
                id="theme"
                title={t('settings.appearance.theme.title')}
                description={t('settings.appearance.theme.description')}
            >
                <SegmentedControl<Theme>
                    name="theme"
                    label={t('settings.appearance.theme.title')}
                    value={appearance}
                    options={themes.map(({ value, key }) => ({
                        value,
                        label: t(key),
                        Icon: icons[value],
                    }))}
                    onChange={(value) =>
                        revealFrom(
                            document.activeElement ?? document.body,
                            () => updateAppearance(value),
                        )
                    }
                    className="self-start"
                />
            </SettingsSection>

            <SettingsSection
                id="language"
                title={t('settings.appearance.language.title')}
                description={t('settings.appearance.language.description')}
            >
                <SegmentedControl<Locale>
                    name="locale"
                    label={t('settings.appearance.language.title')}
                    value={locale}
                    options={locales.map((option) => ({
                        value: option,
                        label: localeNames[option].name,
                        lang: option.replace('_', '-'),
                    }))}
                    onChange={changeLocale}
                    className="self-start"
                />
            </SettingsSection>
        </>
    );
}
