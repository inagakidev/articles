import { Link, usePage } from '@inertiajs/react';
import { PenLine } from 'lucide-react';
import AccountMenu from '@/components/site/account-menu';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/site/language-switch';
import SiteLogo from '@/components/site/site-logo';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { useTranslation } from '@/lib/i18n';
import { dashboard, login, register } from '@/routes';
import { create } from '@/routes/articles';

export default function SiteHeader() {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    return (
        <header className="border-b border-border bg-bg">
            <div className="mx-auto flex h-18 max-w-page items-center gap-4 px-4 sm:px-8">
                <SiteLogo compactOnMobile />
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <ThemeToggle />
                    <LanguageToggle />
                    {auth.user ? (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                size="lg"
                                className="hidden sm:inline-flex"
                            >
                                <Link href={dashboard()}>
                                    {t('site.nav.my_articles')}
                                </Link>
                            </Button>
                            <Button asChild size="lg">
                                <Link href={create()}>
                                    <PenLine aria-hidden="true" />
                                    {t('site.nav.write')}
                                </Link>
                            </Button>
                            <AccountMenu />
                        </>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="lg">
                                <Link href={login()}>
                                    {t('site.nav.login')}
                                </Link>
                            </Button>
                            <Button asChild size="lg">
                                <Link href={register()}>
                                    {t('site.nav.register')}
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
