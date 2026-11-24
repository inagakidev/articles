import type { ReactNode } from 'react';
import LandingHeader from '@/layouts/parts/landing-header';
import SiteFooter from '@/layouts/parts/site-footer';

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
