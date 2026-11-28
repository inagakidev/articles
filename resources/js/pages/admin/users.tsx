import { Head, Link, router } from '@inertiajs/react';
import { Search, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import TableRegion from '@/components/ui/table-region';
import UserAvatar from '@/components/ui/user-avatar';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { users as usersRoute } from '@/routes/admin';
import { show } from '@/routes/admin/users';

type Status = 'admin' | 'banned' | 'suspended' | 'active';

type Row = {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    since: string | null;
    status: Status;
    penalties: number;
};

type Props = {
    filters: { q: string | null };
    users: {
        data: Row[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
};

function listUrl(q: string | null, page = 1): string {
    const query: Record<string, string | number> = {};

    if (q) query.q = q;
    if (page > 1) query.page = page;

    return usersRoute({ query }).url;
}

const statusTone: Record<Status, string> = {
    admin: 'bg-surface-selected text-text-on-selected',
    banned: 'bg-danger-bg text-danger-on-bg',
    suspended: 'bg-warning-bg text-warning-on-bg',
    active: 'bg-surface-muted',
};

/**
 * Usuários (RF-254 a RF-256): a busca por nome, username ou e-mail e a
 * situação de cada conta. Penalizar é na página da conta, que mostra o
 * histórico e o efeito antes de confirmar.
 */
export default function Users({ filters, users }: Props) {
    const { t, locale } = useTranslation();
    const [value, setValue] = useState(filters.q ?? '');

    function search(event: FormEvent) {
        event.preventDefault();
        router.get(
            listUrl(value.trim() || null),
            {},
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title={t('admin.users.title')} />

            <div>
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                    {t('admin.users.title')}
                </h1>
                <p className="mt-1.5 text-label text-text-secondary">
                    {t('admin.users.lead')}
                </p>
            </div>

            <form
                role="search"
                onSubmit={search}
                className="relative w-full sm:w-96"
            >
                <label htmlFor="usuarios-busca" className="sr-only">
                    {t('admin.users.search')}
                </label>
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-text-secondary"
                />
                <input
                    id="usuarios-busca"
                    type="search"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={t('admin.users.search')}
                    className="h-11 w-full rounded-xl border border-border-strong bg-surface pr-3 pl-10 text-[0.9375rem] placeholder:text-text-secondary focus-visible:outline-offset-[-1px]"
                />
            </form>

            {users.total === 0 ? (
                <EmptyState
                    Icon={UsersIcon}
                    title={t('admin.users.empty')}
                    text={t('admin.users.empty_text')}
                    className="rounded-card border border-border bg-surface"
                />
            ) : (
                <>
                    <TableRegion label={t('admin.users.caption')}>
                        <table className="w-full min-w-160 text-left text-meta">
                            <caption className="sr-only">
                                {t('admin.users.caption')}
                            </caption>
                            <thead className="text-caption font-bold text-text-secondary">
                                <tr className="border-b border-border">
                                    {(
                                        [
                                            'user',
                                            'since',
                                            'status',
                                            'penalties',
                                        ] as const
                                    ).map((column) => (
                                        <th
                                            key={column}
                                            scope="col"
                                            className="px-4 py-3 font-bold"
                                        >
                                            {t(`admin.users.columns.${column}`)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-border last:border-b-0"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={show(user.id)}
                                                className="flex items-center gap-2.5 hover:underline"
                                            >
                                                <UserAvatar
                                                    name={user.name}
                                                    avatar={user.avatar}
                                                    className="size-8 text-badge"
                                                />
                                                <span className="flex flex-col">
                                                    <strong>{user.name}</strong>
                                                    <span className="text-caption text-text-secondary">
                                                        @{user.username}
                                                    </span>
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.since
                                                ? shortDate(user.since, locale)
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-md px-2 py-0.5 text-caption font-bold',
                                                    statusTone[user.status],
                                                )}
                                            >
                                                {t(
                                                    `admin.users.status.${user.status}`,
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {user.penalties}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableRegion>
                    <Pagination
                        current={users.currentPage}
                        last={users.lastPage}
                        href={(page) => listUrl(filters.q, page)}
                    />
                </>
            )}
        </>
    );
}
