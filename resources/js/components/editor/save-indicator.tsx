import type { SaveStatus } from '@/hooks/use-autosave';
import { useTranslation } from '@/lib/i18n';
export default function SaveIndicator({
    status,
    savedAt,
}: {
    status: SaveStatus;
    savedAt: string | null;
}) {
    const { t, locale } = useTranslation();
    const time = savedAt
        ? new Intl.DateTimeFormat(locale.replace('_', '-'), {
              hour: '2-digit',
              minute: '2-digit',
          }).format(new Date(savedAt))
        : '';
    const text =
        status === 'saving'
            ? t('editor.status.saving')
            : status === 'error'
              ? t('editor.status.error')
              : status === 'invalid'
                ? t('editor.status.invalid')
                : savedAt
                  ? t('editor.status.saved', { time })
                  : t('editor.status.unsaved');

    return (
        <span
            role="status"
            className={
                status === 'error' || status === 'invalid'
                    ? 'truncate text-caption font-semibold text-danger-fg'
                    : 'truncate text-caption text-text-secondary'
            }
        >
            {text}
        </span>
    );
}
