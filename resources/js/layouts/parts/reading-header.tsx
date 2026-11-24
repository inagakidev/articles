import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ListTree, Search } from 'lucide-react';
import { useState } from 'react';
import ArticleToc from '@/components/articles/article-toc';
import AccountMenu from '@/layouts/parts/account-menu';
import NotificationBell from '@/components/notifications/notification-bell';
import { LanguageToggle } from '@/components/preferences/language-switch';
import SiteLogo from '@/layouts/parts/site-logo';
import { ThemeToggle } from '@/components/preferences/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useTranslation } from '@/lib/i18n';
import { login, search } from '@/routes';
import { index as articles } from '@/routes/articles';
import type { TocItem } from '@/types';

/**
 * Cabeçalho discreto da leitura (DESIGN §8.1, prancha "Leitura"): a volta
 * para os artigos, a busca, tema, idioma e a conta, com a barra do quanto
 * já foi lido. No celular, o sumário abre por baixo.
 */
export default function ReadingHeader() {
    const { auth, article } = usePage<{ article?: { toc: TocItem[] } }>().props;
    const { t } = useTranslation();
    const [tocOpen, setTocOpen] = useState(false);
    const toc = article?.toc ?? [];

    return (
        <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md backdrop-saturate-150">
            <div className="mx-auto flex h-16 max-w-page items-center gap-2 px-4 sm:gap-4 sm:px-8">
                <Link
                    href={articles()}
                    aria-label={t('reading.back')}
                    className="inline-flex size-10 items-center justify-center rounded-full hover:bg-surface-hover sm:hidden"
                >
                    <ArrowLeft aria-hidden="true" className="size-5" />
                </Link>
                <SiteLogo compactOnMobile />
                <Link
                    href={articles()}
                    className="ml-2 hidden items-center gap-1.5 text-meta font-bold hover:underline sm:inline-flex"
                >
                    <ArrowLeft aria-hidden="true" className="size-4" />
                    {t('site.nav.articles')}
                </Link>
                <div className="ml-auto flex items-center gap-1">
                    {toc.length > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="size-10 rounded-full px-0 xl:hidden"
                            aria-label={t('preview.toc')}
                            onClick={() => setTocOpen(true)}
                        >
                            <ListTree aria-hidden="true" className="size-5" />
                        </Button>
                    )}
                    <Button
                        asChild
                        variant="ghost"
                        className="size-10 rounded-full px-0"
                    >
                        <Link href={search()} aria-label={t('search.label')}>
                            <Search aria-hidden="true" className="size-5" />
                        </Link>
                    </Button>
                    <ThemeToggle className="max-sm:hidden" />
                    <LanguageToggle className="max-sm:hidden" />
                    <NotificationBell />
                    {auth.user ? (
                        <AccountMenu />
                    ) : (
                        <Button asChild variant="subtle" size="md">
                            <Link href={login()}>{t('site.nav.login')}</Link>
                        </Button>
                    )}
                </div>
            </div>
            <div aria-hidden="true" className="h-[3px]">
                <div className="reading-progress h-full bg-linear-to-r from-primary to-pastel-lilac" />
            </div>

            <Sheet open={tocOpen} onOpenChange={setTocOpen}>
                <SheetContent
                    side="bottom"
                    className="max-h-[75svh] overflow-y-auto rounded-t-section p-5 xl:hidden"
                >
                    <SheetTitle className="sr-only">
                        {t('preview.toc')}
                    </SheetTitle>
                    <ArticleToc
                        items={toc}
                        onNavigate={() => setTocOpen(false)}
                    />
                </SheetContent>
            </Sheet>
        </header>
    );
}
