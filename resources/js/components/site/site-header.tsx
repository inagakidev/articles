import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Menu, Newspaper, PenLine } from 'lucide-react';
import { useState } from 'react';
import AccountMenu from '@/components/site/account-menu';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/site/language-switch';
import SiteLogo from '@/components/site/site-logo';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useWriteHref } from '@/hooks/use-write-href';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { index as articles, mine } from '@/routes/articles';

/**
 * Cabeçalho das páginas públicas (prancha "Home"): logo, "Artigos" e
 * "Categorias", tema, idioma e a conta. No celular, a navegação vai para o
 * menu. A busca entra com a fatia 13.
 */
export default function SiteHeader() {
    const { props, url } = usePage();
    const { auth } = props;
    const { t } = useTranslation();
    const writeHref = useWriteHref();
    const [menuOpen, setMenuOpen] = useState(false);
    const onArticles = url === '/artigos' || url.startsWith('/artigos?');

    const nav = [
        {
            href: articles().url,
            label: t('site.nav.articles'),
            Icon: Newspaper,
            current: onArticles,
        },
        {
            href: `${articles().url}#categorias`,
            label: t('site.nav.categories'),
            Icon: LayoutGrid,
            current: false,
        },
    ];

    return (
        <header className="border-b border-border bg-bg">
            <div className="mx-auto flex h-18 max-w-page items-center gap-4 px-4 sm:px-8">
                <SiteLogo compactOnMobile />
                <nav
                    aria-label={t('site.nav.label')}
                    className="hidden gap-1 md:flex"
                >
                    {nav.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            aria-current={item.current ? 'page' : undefined}
                            className={cn(
                                'inline-flex h-10 items-center rounded-full px-4 text-[0.9375rem] font-semibold hover:bg-surface-hover',
                                item.current &&
                                    'bg-surface-selected font-bold text-text-on-selected hover:bg-surface-selected',
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <ThemeToggle className="max-sm:hidden" />
                    <LanguageToggle className="max-sm:hidden" />
                    {auth.user ? (
                        <Button
                            asChild
                            variant="ghost"
                            size="lg"
                            className="hidden sm:inline-flex"
                        >
                            <Link href={mine()}>
                                {t('site.nav.my_articles')}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="subtle"
                            size="lg"
                            className="hidden sm:inline-flex"
                        >
                            <Link href={login()}>{t('site.nav.login')}</Link>
                        </Button>
                    )}
                    <Button asChild size="lg">
                        <Link href={writeHref}>
                            <PenLine aria-hidden="true" />
                            {t('site.nav.write')}
                        </Link>
                    </Button>
                    {auth.user && <AccountMenu />}
                    <Button
                        type="button"
                        variant="ghost"
                        className="size-10 rounded-full px-0 md:hidden"
                        aria-label={t('site.nav.menu')}
                        onClick={() => setMenuOpen(true)}
                    >
                        <Menu aria-hidden="true" className="size-5" />
                    </Button>
                </div>
            </div>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="right" className="w-72 p-5 md:hidden">
                    <SheetTitle className="font-display text-h3 font-extrabold">
                        {t('site.nav.menu')}
                    </SheetTitle>
                    <nav
                        aria-label={t('site.nav.label')}
                        className="flex flex-col gap-1"
                    >
                        {nav.map(({ href, label, Icon, current }) => (
                            <Link
                                key={label}
                                href={href}
                                aria-current={current ? 'page' : undefined}
                                onClick={() => setMenuOpen(false)}
                                className="flex h-11 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-surface-hover aria-[current=page]:bg-surface-selected aria-[current=page]:font-bold aria-[current=page]:text-text-on-selected"
                            >
                                <Icon aria-hidden="true" className="size-5" />
                                {label}
                            </Link>
                        ))}
                        {auth.user ? (
                            <Link
                                href={mine()}
                                className="flex h-11 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-surface-hover"
                            >
                                <PenLine
                                    aria-hidden="true"
                                    className="size-5"
                                />
                                {t('site.nav.my_articles')}
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="flex h-11 items-center gap-3 rounded-xl px-3 font-bold text-primary-text hover:bg-surface-hover"
                            >
                                {t('site.nav.login')}
                            </Link>
                        )}
                    </nav>
                    <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}
