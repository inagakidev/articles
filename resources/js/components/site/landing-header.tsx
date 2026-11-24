import { Link, usePage } from '@inertiajs/react';
import { LanguageToggle } from '@/components/site/language-switch';
import AccountMenu from '@/components/site/account-menu';
import SiteLogo from '@/components/site/site-logo';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Button } from '@/components/ui/button';
import MotionToggle from '@/components/ui/motion-toggle';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { login, register } from '@/routes';
import { create, index as articles } from '@/routes/articles';

/** Âncoras das seções da página de apresentação. */
const sections: { id: string; label: TranslationKey }[] = [
    { id: 'como', label: 'landing.nav.how' },
    { id: 'recursos', label: 'landing.nav.features' },
    { id: 'para-quem', label: 'landing.nav.audience' },
    { id: 'faq', label: 'landing.nav.faq' },
];

/** Botões de ferramenta do cabeçalho: redondos, sem borda, como o de pausar. */
const toolClass =
    'size-10 shrink-0 rounded-full px-0 text-text-primary hover:bg-surface-hover';

/**
 * Cabeçalho fixo e translúcido da página de apresentação: atalhos para as
 * seções, tema, idioma, "Pausar animações" (RF-383) e a chamada para
 * escrever.
 */
export default function LandingHeader() {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    return (
        <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md backdrop-saturate-150">
            <div className="mx-auto flex h-17 max-w-300 items-center gap-4 px-[clamp(16px,4vw,32px)]">
                <SiteLogo compactOnMobile />
                <nav
                    aria-label={t('landing.nav.label')}
                    className="ml-4 hidden gap-0.5 min-[961px]:flex"
                >
                    {sections.map(({ id, label }) => (
                        <a
                            key={id}
                            href={`#${id}`}
                            className="inline-flex h-10 items-center rounded-full px-3.5 text-label font-semibold text-text-primary hover:bg-surface-hover"
                        >
                            {t(label)}
                        </a>
                    ))}
                </nav>
                <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                    <ThemeToggle className={toolClass} />
                    <LanguageToggle className={toolClass} />
                    <MotionToggle variant="icon" />
                    <Link
                        href={articles()}
                        className="hidden rounded-full px-2.5 text-label font-bold hover:underline min-[961px]:inline"
                    >
                        {t('landing.cta.read_short')}
                    </Link>
                    {auth.user ? (
                        <>
                            <Button
                                asChild
                                size="md"
                                className="font-bold shadow-primary"
                            >
                                <Link href={create()}>
                                    {t('site.nav.write')}
                                </Link>
                            </Button>
                            <AccountMenu />
                        </>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="hidden rounded-full px-2.5 text-label font-bold text-primary-text hover:underline min-[561px]:inline"
                            >
                                {t('site.nav.login')}
                            </Link>
                            <Button
                                asChild
                                size="md"
                                className="font-bold shadow-primary"
                            >
                                <Link href={register()}>
                                    <span className="sm:hidden">
                                        {t('landing.cta.write_short')}
                                    </span>
                                    <span className="hidden sm:inline">
                                        {t('landing.cta.write')}
                                    </span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
