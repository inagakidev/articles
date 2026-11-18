import type { ReactNode } from 'react';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';

/** Páginas públicas: cabeçalho, conteúdo e rodapé. */
export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary">
            <SiteHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
        </div>
    );
}
