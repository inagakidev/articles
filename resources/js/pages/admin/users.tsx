import { Form, Head } from '@inertiajs/react';
import Pagination from '@/components/ui/pagination';
import TableRegion from '@/components/ui/table-region';
import { useTranslation } from '@/lib/i18n';
import { users } from '@/routes/admin';
import * as userRoutes from '@/routes/admin/users';

type UserRow = {
    id: number;
    name: string;
    username: string;
    email: string;
    banned: boolean;
    suspendedUntil: string | null;
    penalty: {
        type: 'suspension' | 'ban';
        reason: string;
        endsAt: string | null;
    } | null;
};

type Props = {
    filters: { q: string | null };
    users: {
        data: UserRow[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
};

export default function Users({ filters, users: rows }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('admin.users.title')} />
            <div>
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold">
                    {t('admin.users.title')}
                </h1>
                <Form
                    action={users().url}
                    method="get"
                    className="mt-5 flex gap-2"
                >
                    <input
                        name="q"
                        defaultValue={filters.q ?? ''}
                        placeholder={t('admin.users.search')}
                        className="h-10 min-w-0 flex-1 rounded-full border border-border bg-surface px-4"
                    />
                    <button
                        className="h-10 rounded-full border border-border px-4"
                        type="submit"
                    >
                        Buscar
                    </button>
                </Form>
            </div>

            <TableRegion label={t('admin.users.title')}>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">Usuário</th>
                            <th className="text-left">Estado</th>
                            <th className="text-left">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.data.map((row) => (
                            <tr key={row.id}>
                                <td className="py-4">
                                    <strong>{row.name}</strong>
                                    <div className="text-meta text-text-secondary">
                                        @{row.username} · {row.email}
                                    </div>
                                </td>
                                <td>
                                    {row.banned
                                        ? t('admin.users.ban')
                                        : row.suspendedUntil
                                          ? t('admin.users.suspend')
                                          : '—'}
                                </td>
                                <td>
                                    {row.banned || row.suspendedUntil ? (
                                        <Form
                                            action={
                                                userRoutes.reactivate(row.id)
                                                    .url
                                            }
                                            method="post"
                                        >
                                            <button
                                                type="submit"
                                                className="h-9 rounded-full border border-border px-3 text-meta"
                                            >
                                                {t('admin.users.reactivate')}
                                            </button>
                                        </Form>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Form
                                                action={
                                                    userRoutes.suspend(row.id)
                                                        .url
                                                }
                                                method="post"
                                                className="flex gap-2"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="policy_item"
                                                    value="2.1"
                                                />
                                                <input
                                                    type="hidden"
                                                    name="reason"
                                                    value="Penalidade aplicada pela administração."
                                                />
                                                <input
                                                    name="days"
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    defaultValue="7"
                                                    className="h-9 w-20 rounded-full border border-border px-3"
                                                />
                                                <button
                                                    type="submit"
                                                    className="h-9 rounded-full border border-border px-3 text-meta"
                                                >
                                                    {t('admin.users.suspend')}
                                                </button>
                                            </Form>
                                            <Form
                                                action={
                                                    userRoutes.ban(row.id).url
                                                }
                                                method="post"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="policy_item"
                                                    value="2.1"
                                                />
                                                <input
                                                    type="hidden"
                                                    name="reason"
                                                    value="Penalidade aplicada pela administração."
                                                />
                                                <button
                                                    type="submit"
                                                    className="border-danger h-9 rounded-full border px-3 text-meta text-danger-fg"
                                                >
                                                    {t('admin.users.ban')}
                                                </button>
                                            </Form>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableRegion>

            <Pagination
                current={rows.currentPage}
                last={rows.lastPage}
                href={(page) => users({ query: { ...filters, page } }).url}
            />
        </>
    );
}
