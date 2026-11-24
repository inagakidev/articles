import { LanguageSelect } from '@/components/preferences/language-switch';
import SiteLogo from '@/layouts/parts/site-logo';
import { ThemeSelect } from '@/components/preferences/theme-toggle';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { content, privacy, terms } from '@/routes/policies';

export default function SiteFooter() {
    const { t } = useTranslation();

    return (
        <footer className="border-t border-border bg-bg">
            <div className="mx-auto flex max-w-page flex-wrap items-start justify-between gap-8 px-4 py-10 sm:px-8">
                <div className="flex max-w-sm flex-col gap-3">
                    <SiteLogo withTagline height={56} />
                    <p className="text-meta text-text-secondary">
                        {t('site.footer.about')}
                    </p>
                </div>
                <nav
                    aria-label={t('policies.breadcrumb.policies')}
                    className="flex flex-col gap-2 text-meta font-semibold"
                >
                    <TextLink href={terms()}>{t('policies.terms')}</TextLink>
                    <TextLink href={content()}>
                        {t('policies.content')}
                    </TextLink>
                    <TextLink href={privacy()}>
                        {t('policies.privacy')}
                    </TextLink>
                </nav>
                <div className="flex gap-3">
                    <LanguageSelect />
                    <ThemeSelect />
                </div>
            </div>
        </footer>
    );
}
