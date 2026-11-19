import { LanguageSelect } from '@/components/site/language-switch';
import SiteLogo from '@/components/site/site-logo';
import { ThemeSelect } from '@/components/site/theme-toggle';
import { useTranslation } from '@/lib/i18n';

export default function SiteFooter() {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-border bg-bg">
            <div className="mx-auto flex max-w-page flex-wrap items-start justify-between gap-8 px-4 py-10 sm:px-8">
                <div className="flex max-w-sm flex-col gap-3">
                    <SiteLogo size={28} />
                    <p className="text-meta text-text-secondary">
                        {t('site.footer.about')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <LanguageSelect />
                    <ThemeSelect />
                </div>
            </div>
        </footer>
    );
}
