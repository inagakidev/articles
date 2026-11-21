import { Link, router, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { edit as settings } from '@/routes/profile';

type Item = {
    label: string;
    href: NonNullable<InertiaLinkProps['href']>;
    Icon: LucideIcon;
    /** Classes do item (por exemplo, só no celular). */
    className?: string;
};

/**
 * Menu da conta de quem entrou: nome e e-mail, atalhos e "Sair". Fica nos
 * cabeçalhos do site, da apresentação e do painel; para a administradora,
 * tem o atalho para o painel (D75).
 */
export default function AccountMenu({
    items = [],
    className,
}: {
    /** Atalhos próprios do cabeçalho, antes dos de sempre. */
    items?: Item[];
    className?: string;
}) {
    const { auth } = usePage().props;
    const { t } = useTranslation();

    if (!auth.user) {
        return null;
    }

    const user = auth.user;
    const links: Item[] = [
        ...items,
        ...(user.is_admin
            ? [
                  {
                      label: t('site.account.admin'),
                      href: adminDashboard(),
                      Icon: LayoutDashboard,
                  },
              ]
            : []),
        { label: t('site.account.settings'), href: settings(), Icon: Settings },
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('site.account.menu', { name: user.name })}
                className={cn('shrink-0 rounded-full', className)}
            >
                <UserAvatar
                    name={user.name}
                    avatar={user.avatar}
                    className="size-9 text-caption"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuLabel className="flex flex-col font-normal">
                    <span className="font-bold">{user.name}</span>
                    <span className="text-caption text-text-secondary">
                        {user.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {links.map(({ label, href, Icon, className: itemClass }) => (
                    <DropdownMenuItem key={label} asChild className={itemClass}>
                        <Link href={href}>
                            <Icon aria-hidden="true" />
                            {label}
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={logout()}
                        as="button"
                        className="w-full"
                        onClick={() => router.flushAll()}
                    >
                        <LogOut aria-hidden="true" />
                        {t('site.account.logout')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
