import { Link } from '@inertiajs/react';
import { Globe, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminNav from '@/components/admin/admin-nav';
import SiteLogo from '@/components/site/site-logo';
import AccountMenu from '@/components/site/account-menu';
import Pill from '@/components/ui/pill';
import { useTranslation } from '@/lib/i18n';
import { home } from '@/routes';

/**
 * Moldura do painel da administração (prancha "Admin · Painel"): cabeçalho
 * com o selo do 2FA e o menu da conta, seções à esquerda e o conteúdo.
 * Sem mascote (DESIGN §5.3).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary">
            <header className="border-b border-border bg-surface">
                <div className="flex h-16 items-center gap-3.5 px-4 sm:px-6">
                    <SiteLogo compactOnMobile height={30} />
                    <Pill
                        tone="lavender"
                        className="rounded-sm px-2 py-0.5 text-badge"
                    >
                        {t('admin.label')}
                    </Pill>
                    <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
                        <Link
                            href={home()}
                            className="hidden rounded-sm text-meta font-bold text-primary-text hover:underline sm:inline"
                        >
                            {t('admin.header.site')}
                        </Link>
                        <span className="inline-flex items-center gap-1.5 text-caption font-bold text-success-fg">
                            <ShieldCheck
                                aria-hidden="true"
                                className="size-4"
                            />
                            {t('admin.header.two_factor')}
                        </span>
                        <AccountMenu
                            items={[
                                {
                                    label: t('admin.header.site'),
                                    href: home(),
                                    Icon: Globe,
                                    className: 'sm:hidden',
                                },
                            ]}
                        />
                    </div>
                </div>
            </header>
            <div className="flex flex-1 flex-col lg:flex-row">
                <AdminNav />
                <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 pt-6 pb-16 sm:px-8 sm:pt-7 lg:border-l lg:border-border">
                    {children}
                </main>
            </div>
        </div>
    );
}
