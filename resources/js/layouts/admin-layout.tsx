import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminNav from '@/components/admin/admin-nav';
import SiteLogo from '@/components/site/site-logo';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Pill from '@/components/ui/pill';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/lib/i18n';
import { home, logout } from '@/routes';

/**
 * Moldura do painel da administração (prancha "Admin · Painel"): cabeçalho
 * com o selo do 2FA e o menu da conta, seções à esquerda e o conteúdo.
 * Sem mascote (DESIGN §5.3).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const getInitials = useInitials();
    const name = auth.user?.name ?? '';

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
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                aria-label={t('admin.header.account', { name })}
                                className="rounded-[9px]"
                            >
                                <span
                                    aria-hidden="true"
                                    className="inline-flex size-9 items-center justify-center rounded-[9px] bg-pastel-lavender font-display text-caption font-extrabold text-pastel-lavender-fg"
                                >
                                    {getInitials(name)}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="min-w-52"
                            >
                                <DropdownMenuLabel className="flex flex-col font-normal">
                                    <span className="font-bold">{name}</span>
                                    <span className="text-caption text-text-secondary">
                                        {auth.user?.email}
                                    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="sm:hidden">
                                    <Link href={home()}>
                                        {t('admin.header.site')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        className="w-full"
                                        onClick={() => router.flushAll()}
                                    >
                                        <LogOut aria-hidden="true" />
                                        {t('admin.header.logout')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
