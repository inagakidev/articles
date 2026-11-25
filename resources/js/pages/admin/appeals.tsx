import { Form, Head } from '@inertiajs/react';
import Pagination from '@/components/ui/pagination';
import TableRegion from '@/components/ui/table-region';
import { useTranslation } from '@/lib/i18n';
import { appeals } from '@/routes/admin';
import * as appealRoutes from '@/routes/admin/appeals';

type AppealRow = {
    id: number;
    user: { name: string; username: string };
    penalty: 'suspension' | 'ban';
    policyItem: string;
    justification: string;
    createdAt: string;
};

type Props = {
    filters: { status: 'open' | 'accepted' | 'rejected' };
    appeals: {
        data: AppealRow[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
    openCount: number;
};

export default function Appeals({ filters, appeals: rows, openCount }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('admin.appeals.title')} />
            <div>
                <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold">
                    {t('admin.appeals.title')}
                </h1>
                <p className="mt-2 text-label text-text-secondary">
                    {openCount}
                </p>
            </div>
            <TableRegion label={t('admin.appeals.title')}>
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left">Usuário</th>
                            <th className="text-left">Justificativa</th>
                            <th className="text-left">Decisão</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.data.map((row) => (
                            <tr key={row.id}>
                                <td className="py-4">
                                    <strong>{row.user.name}</strong>
                                    <div className="text-meta">
                                        @{row.user.username} · {row.penalty}
                                    </div>
                                </td>
                                <td className="max-w-xl py-4">
                                    {row.justification}
                                </td>
                                <td>
                                    {filters.status === 'open' ? (
                                        <div className="flex gap-2">
                                            <Form
                                                action={
                                                    appealRoutes.decide(row.id)
                                                        .url
                                                }
                                                method="post"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="accepted"
                                                    value="1"
                                                />
                                                <input
                                                    name="reason"
                                                    required
                                                    minLength={10}
                                                    placeholder={t(
                                                        'moderation.appeals.reason',
                                                    )}
                                                    className="h-9 rounded-full border border-border px-3"
                                                />
                                                <button
                                                    type="submit"
                                                    className="ml-2 h-9 rounded-full bg-primary px-3 text-meta text-text-on-primary"
                                                >
                                                    {t('admin.appeals.accept')}
                                                </button>
                                            </Form>
                                            <Form
                                                action={
                                                    appealRoutes.decide(row.id)
                                                        .url
                                                }
                                                method="post"
                                            >
                                                <input
                                                    type="hidden"
                                                    name="accepted"
                                                    value="0"
                                                />
                                                <input
                                                    name="reason"
                                                    required
                                                    minLength={10}
                                                    placeholder={t(
                                                        'moderation.appeals.reason',
                                                    )}
                                                    className="h-9 rounded-full border border-border px-3"
                                                />
                                                <button
                                                    type="submit"
                                                    className="ml-2 h-9 rounded-full border border-border px-3 text-meta"
                                                >
                                                    {t('admin.appeals.reject')}
                                                </button>
                                            </Form>
                                        </div>
                                    ) : (
                                        <Form
                                            action={
                                                appealRoutes.reopen(row.id).url
                                            }
                                            method="post"
                                        >
                                            <button
                                                type="submit"
                                                className="h-9 rounded-full border border-border px-3 text-meta"
                                            >
                                                {t('admin.appeals.reopen')}
                                            </button>
                                        </Form>
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
                href={(page) =>
                    appeals({ query: { status: filters.status, page } }).url
                }
            />
        </>
    );
}
