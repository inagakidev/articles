import { Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { audit, dashboard, queue, taxonomy } from '@/routes/admin';

type Item = {
    label: TranslationKey;
    href: NonNullable<InertiaLinkProps['href']>;
    /** Quantos itens esperam pela administradora (fila, denúncias). */
    count?: number;
};

/**
 * Seções do painel. Cada uma entra aqui com a fatia dela (D75): Denúncias,
 * Usuários e Contestações chegam com as fatias 20 e 21.
 */
function useItems(): Item[] {
    const { adminCounts } = usePage<{
        adminCounts?: { queue: number } | null;
    }>().props;

    return [
        { label: 'admin.nav.dashboard', href: dashboard() },
        { label: 'admin.nav.queue', href: queue(), count: adminCounts?.queue },
        { label: 'admin.nav.taxonomy', href: taxonomy() },
        { label: 'admin.nav.audit', href: audit() },
    ];
}

/** Lista lateral no desktop; faixa rolável acima do conteúdo no celular. */
export default function AdminNav() {
    const { t } = useTranslation();
    const { isCurrentUrl } = useCurrentUrl();
    const items = useItems();

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
