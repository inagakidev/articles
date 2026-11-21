import { Check, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/lib/i18n';

/**
 * Códigos de recuperação do 2FA, com copiar e baixar em .txt. Aparecem só
 * logo depois de gerados (ativação e "Gerar novos códigos").
 */
export default function RecoveryCodes({ codes }: { codes: string[] }) {
    const { t } = useTranslation();
    const [copied, copy] = useClipboard();
    const text = codes.join('\n');

    function download() {
        const file = new Blob(
            [
                `${t('account.two_factor.setup.recovery.file_title')}\n\n${text}\n`,
            ],
            { type: 'text/plain' },
        );
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = 'he4rt-ink-recovery-codes.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return (
        <div className="w-full rounded-inner bg-surface-muted p-4">
            <ul
                aria-label={t('account.two_factor.setup.recovery.list')}
                className="grid grid-cols-1 gap-x-4 gap-y-2 font-mono text-meta font-bold sm:grid-cols-2"
            >
                {codes.map((code) => (
                    <li key={code}>{code}</li>
                ))}
            </ul>
            <div className="mt-4 flex justify-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void copy(text)}
                >
                    {copied === text ? (
                        <Check aria-hidden="true" />
                    ) : (
                        <Copy aria-hidden="true" />
                    )}
                    {t(
                        copied === text
                            ? 'account.two_factor.setup.recovery.copied'
                            : 'account.two_factor.setup.recovery.copy',
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={download}
                >
                    <Download aria-hidden="true" />
                    {t('account.two_factor.setup.recovery.download')}
                </Button>
            </div>
        </div>
    );
}
