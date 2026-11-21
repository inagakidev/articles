import type { ReactNode } from 'react';
import LandingHeader from '@/components/site/landing-header';
import SiteFooter from '@/components/site/site-footer';

/** Página de apresentação: cabeçalho com as seções, conteúdo e rodapé. */
export default function LandingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col overflow-x-clip bg-bg text-text-primary">
            <LandingHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
        </div>
    );
}
