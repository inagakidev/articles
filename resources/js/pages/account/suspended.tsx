import { Head, Link } from '@inertiajs/react';
import { BookOpen, LogOut, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthCardHeader } from '@/layouts/auth-layout';
import { shortDate, time } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { logout } from '@/routes';
import { content } from '@/routes/policies';

type Props = {
    penalty: {
        type: 'suspension' | 'ban';
        reason: string;
        policyItem: string;
        endsAt: string | null;
        appealDeadline: string | null;
        /** Link assinado da contestação; nulo se o prazo passou ou já foi enviada. */
        appealUrl: string | null;
        appealed: boolean;
        notifiedAt: string;
    } | null;
};

/**
 * Conta penalizada (prancha "Conta suspensa", RF-206, RF-225): até quando,
 * o motivo, o que acontece com o conteúdo e o caminho para contestar
 * (RF-229). No banimento, avisa que a conta é excluída se não houver
 * contestação aceita.
 */
export default function Suspended({ penalty }: Props) {
    const { t, locale } = useTranslation();
    const banned = penalty?.type === 'ban';
    const until = penalty?.endsAt
        ? `${shortDate(penalty.endsAt, locale)}, ${time(penalty.endsAt, locale)}`
        : '';

    return (
        <>
            <Head
                title={t(
                    banned
                        ? 'account.penalty.banned.title'
                        : 'account.penalty.suspended.title',
                )}
            />
            <AuthCardHeader
                title={
                    banned
                        ? t('account.penalty.banned.title')
                        : t('account.penalty.suspended.until', { date: until })
                }
                description={
                    penalty
                        ? t(
                              banned
                                  ? 'account.penalty.banned.text'
                                  : 'account.penalty.suspended.text',
                              {
                                  item: penalty.policyItem,
                              },
                          )
                        : undefined
                }
            />

            {penalty && (
                <div className="flex flex-col gap-1.5 rounded-2xl bg-surface-muted px-4 py-3.5 text-meta">
                    <span className="font-bold">
                        {t('account.penalty.reason_label')}
                    </span>
                    <q className="text-text-secondary">{penalty.reason}</q>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {penalty?.appealUrl ? (
                    <Button asChild size="xl" className="w-full">
                        <a href={penalty.appealUrl}>
                            <Scale aria-hidden="true" />
                            {t(
                                banned
                                    ? 'account.penalty.contest_ban'
                                    : 'account.penalty.contest',
                            )}
                        </a>
                    </Button>
                ) : (
                    penalty && (
                        <p className="rounded-xl bg-surface-muted px-4 py-3 text-center text-meta text-text-secondary">
                            {penalty.appealed
                                ? t('account.penalty.appealed')
                                : t('account.penalty.appeal_closed')}
                        </p>
                    )
                )}
                <Button asChild variant="outline" size="xl" className="w-full">
                    <Link
                        href={content({
                            query: penalty ? { item: penalty.policyItem } : {},
                        })}
                    >
                        <BookOpen aria-hidden="true" />
                        {t('account.penalty.policy')}
                    </Link>
                </Button>
                <Button asChild variant="subtle" size="xl" className="w-full">
                    <Link href={logout()} method="post" as="button">
                        <LogOut aria-hidden="true" />
                        {t('site.account.logout')}
                    </Link>
                </Button>
            </div>

            {penalty && (
                <p className="text-center text-meta text-text-secondary">
                    {t('account.penalty.email', {
                        date: shortDate(penalty.notifiedAt, locale),
                    })}
                </p>
            )}
        </>
    );
}
