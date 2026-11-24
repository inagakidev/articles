import type { ReactNode } from 'react';
import ReadingHeader from '@/components/site/reading-header';
import SiteFooter from '@/components/site/site-footer';

/** Leitura de um artigo: cabeçalho discreto, o texto e o rodapé do site. */
export default function ReadingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary">
            <ReadingHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
        </div>
    );
}
