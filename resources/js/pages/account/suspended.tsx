import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { logout } from '@/routes';

type Props = {
    penalty: {
        type: 'suspension' | 'ban';
        reason: string;
        policyItem: string;
        endsAt: string | null;
        appealDeadline: string | null;
        appealUrl: string | null;
    } | null;
};

export default function Suspended({ penalty }: Props) {
    const { t } = useTranslation();
    const banned = penalty?.type === 'ban';

    return (
        <>
            <Head
                title={t(
                    banned
                        ? 'account.penalty.banned.title'
                        : 'account.penalty.suspended.title',
                )}
            />
            <main className="mx-auto max-w-xl px-6 py-16">
                <h1 className="font-display text-3xl font-extrabold">
                    {t(
                        banned
                            ? 'account.penalty.banned.title'
                            : 'account.penalty.suspended.title',
                    )}
                </h1>
                <p className="mt-3 text-text-secondary">
                    {banned
                        ? t('account.penalty.banned.body')
                        : t('account.penalty.suspended.body', {
                              date: penalty?.endsAt
                                  ? new Date(penalty.endsAt).toLocaleString()
                                  : '—',
                          })}
                </p>
                {penalty && (
                    <div className="mt-6 rounded-card border border-border bg-surface p-5">
                        <p className="text-label font-bold">
                            {penalty.policyItem}
                        </p>
                        <p className="mt-2 text-text-secondary">
                            {penalty.reason}
                        </p>
                    </div>
                )}
                <div className="mt-6 flex gap-3">
                    {penalty?.appealUrl && (
                        <Link
                            href={penalty.appealUrl}
                            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-label font-bold text-text-on-primary"
                        >
                            {t('account.penalty.contest')}
                        </Link>
                    )}
                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        className="h-10 rounded-full border border-border px-5 text-label font-bold"
                    >
                        {t('account.verify.logout')}
                    </Link>
                </div>
            </main>
        </>
    );
}
