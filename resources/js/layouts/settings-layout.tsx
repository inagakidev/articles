import { Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Palette, ShieldCheck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { edit as appearance } from '@/routes/appearance';
import { edit as profile } from '@/routes/profile';
import { edit as security } from '@/routes/security';

type Item = {
    label: TranslationKey;
    href: NonNullable<InertiaLinkProps['href']>;
    Icon: LucideIcon;
    /** Só para conta confirmada (e-mail e senha). */
    verified?: boolean;
};

/**
 * Seções das Configurações (prancha "Configurações"). Notificações entra com
 * a fatia 19 e "Excluir conta" com a 22 (D77).
 */
const items: Item[] = [
    { label: 'settings.nav.profile', href: profile(), Icon: UserRound },
    { label: 'settings.nav.appearance', href: appearance(), Icon: Palette },
    {
        label: 'settings.nav.security',
        href: security(),
        Icon: ShieldCheck,
        verified: true,
    },
];

/** Título, seções à esquerda (faixa rolável no celular) e o conteúdo. */
export default function SettingsLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const { isCurrentUrl } = useCurrentUrl();
    const verified = Boolean(auth.user?.email_verified_at);

    return (
        <div className="mx-auto flex w-full max-w-275 flex-col gap-7 px-4 pt-8 pb-24 sm:px-8 sm:pt-10">
            <h1 className="font-display text-[2.25rem]/11 font-extrabold tracking-[-0.02em]">
                {t('settings.title')}
            </h1>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <nav
                    aria-label={t('settings.nav.label')}
                    className="-mx-4 px-4 lg:mx-0 lg:w-65 lg:shrink-0 lg:px-0"
                >
                    <ul className="flex [scrollbar-width:none] gap-1 overflow-x-auto lg:flex-col">
                        {items
                            .filter((item) => !item.verified || verified)
                            .map(({ label, href, Icon }) => {
                                const current = isCurrentUrl(href);

                                return (
                                    <li key={label} className="shrink-0">
                                        <Link
                                            href={href}
                                            aria-current={
                                                current ? 'page' : undefined
                                            }
                                            className={cn(
                                                'flex h-11 items-center gap-2.5 rounded-full px-4 text-label whitespace-nowrap',
                                                current
                                                    ? 'bg-surface-selected font-bold text-text-on-selected'
                                                    : 'font-semibold text-text-primary hover:bg-surface-hover',
                                            )}
                                        >
                                            <Icon
                                                aria-hidden="true"
                                                className="size-[18px]"
                                            />
                                            {t(label)}
                                        </Link>
                                    </li>
                                );
                            })}
                    </ul>
                </nav>
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
