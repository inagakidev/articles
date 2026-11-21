import { CircleCheck } from 'lucide-react';
import type { UsernameCheck } from '@/hooks/use-username-availability';
import { useTranslation } from '@/lib/i18n';

/** Retorno da disponibilidade do username enquanto a pessoa digita (RF-029). */
export default function UsernameHint({ check }: { check: UsernameCheck }) {
    const { t } = useTranslation();

    switch (check.status) {
        case 'checking':
            return <span>{t('account.username.checking')}</span>;
        case 'available':
            return (
                <span className="flex items-center gap-1.5 text-meta font-semibold text-success-fg">
                    <CircleCheck
                        aria-hidden="true"
                        className="size-4 shrink-0"
                    />
                    {t('account.username.available', {
                        username: check.username,
                    })}
                </span>
            );
        case 'unavailable':
            return (
                <span className="text-meta font-semibold text-danger-fg">
                    {check.message}
                </span>
            );
        default:
            return null;
    }
}
