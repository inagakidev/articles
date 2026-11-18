import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import SiteLogo from '@/components/site/site-logo';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { dashboard, login, register } from '@/routes';

export default function SiteHeader() {
    const { auth } = usePage().props;

    return (
        <header className="border-b border-border bg-bg">
            <div className="mx-auto flex h-18 max-w-page items-center gap-4 px-4 sm:px-8">
                <SiteLogo />
                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                    {auth.user ? (
                        <Button asChild size="lg">
                            <Link href={dashboard()}>Meus artigos</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="lg">
                                <Link href={login()}>Entrar</Link>
                            </Button>
                            <Button asChild size="lg">
                                <Link href={register()}>Criar conta</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
