import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard, taxonomy } from '@/routes/admin';

type Item = {
    label: TranslationKey;
    href: NonNullable<InertiaLinkProps['href']>;
    /** Quantos itens esperam pela administradora (fila, denúncias). */
    count?: number;
};

/**
 * Seções do painel. Cada uma entra aqui com a fatia dela (D75): Fila de
 * aprovação, Denúncias, Usuários, Contestações e Auditoria.
 */
const items: Item[] = [
    { label: 'admin.nav.dashboard', href: dashboard() },
    { label: 'admin.nav.taxonomy', href: taxonomy() },
];

/** Lista lateral no desktop; faixa rolável acima do conteúdo no celular. */
export default function AdminNav() {
    const { t } = useTranslation();
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav
            aria-label={t('admin.nav.label')}
            className="border-b border-border px-3 py-2 lg:w-65 lg:shrink-0 lg:border-b-0 lg:px-3 lg:py-5"
        >
            <ul className="flex [scrollbar-width:none] gap-0.5 overflow-x-auto lg:flex-col">
                {items.map(({ label, href, count }) => {
                    const current = isCurrentUrl(href);

                    return (
                        <li key={label} className="shrink-0">
                            <Link
                                href={href}
                                aria-current={current ? 'page' : undefined}
                                className={cn(
                                    'flex h-10.5 items-center gap-2.5 rounded-full px-3.5 text-label whitespace-nowrap',
                                    current
                                        ? 'bg-surface-selected font-extrabold text-text-on-selected'
                                        : 'font-semibold text-text-primary hover:bg-surface-hover',
                                )}
                            >
                                <span className="flex-1">{t(label)}</span>
                                {count !== undefined && count > 0 && (
                                    <span className="min-w-5.5 rounded-full bg-primary px-1.5 text-center text-badge leading-5.5 font-extrabold text-text-on-primary">
                                        {count}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
