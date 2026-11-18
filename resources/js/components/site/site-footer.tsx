import SiteLogo from '@/components/site/site-logo';
import { ThemeSelect } from '@/components/site/theme-toggle';

export default function SiteFooter() {
    return (
        <footer className="border-t border-border bg-bg">
            <div className="mx-auto flex max-w-page flex-wrap items-start justify-between gap-8 px-4 py-10 sm:px-8">
                <div className="flex max-w-sm flex-col gap-3">
                    <SiteLogo tamanho={28} />
                    <p className="text-meta text-text-secondary">
                        O espaço da comunidade He4rt para artigos técnicos. Cada
                        artigo passa por revisão antes de ir ao ar.
                    </p>
                </div>
                <ThemeSelect />
            </div>
        </footer>
    );
}
