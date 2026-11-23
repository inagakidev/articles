import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

export type KeepChoice = 'draft' | 'pending';

/**
 * Retirar da fila com um rascunho mais novo (RF-104, estado R02): o único
 * caso em que pedimos confirmação, porque uma das versões é descartada.
 */
export default function WithdrawDialog({
    open,
    draftMeta,
    pendingMeta,
    processing,
    onConfirm,
    onCancel,
}: {
    open: boolean;
    draftMeta: string;
    pendingMeta: string;
    processing: boolean;
    onConfirm: (keep: KeepChoice) => void;
    onCancel: () => void;
}) {
    const { t } = useTranslation();
    const [keep, setKeep] = useState<KeepChoice>('draft');

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onCancel()}>
            <DialogContent className="rounded-card sm:max-w-lg">
                <DialogTitle className="font-display text-h3 font-extrabold">
                    {t('my_articles.withdraw.title')}
                </DialogTitle>
                <DialogDescription>
                    {t('my_articles.withdraw.text')}
                </DialogDescription>
                <fieldset className="flex flex-col gap-2">
                    <legend className="sr-only">
                        {t('my_articles.withdraw.legend')}
                    </legend>
                    {(
                        [
                            [
                                'draft',
                                'my_articles.withdraw.keep_draft',
                                draftMeta,
                            ],
                            [
                                'pending',
                                'my_articles.withdraw.keep_pending',
                                pendingMeta,
                            ],
                        ] as const
                    ).map(([value, label, meta]) => (
                        <label
                            key={value}
                            className="flex cursor-pointer items-start gap-3 rounded-inner border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-surface-selected"
                        >
                            <input
                                type="radio"
                                name="keep"
                                value={value}
                                checked={keep === value}
                                onChange={() => setKeep(value)}
                                className="mt-1 size-4 accent-primary"
                            />
                            <span className="flex flex-col">
                                <strong>{t(label)}</strong>
                                <span className="text-meta text-text-secondary">
                                    {meta}
                                </span>
                            </span>
                        </label>
                    ))}
                </fieldset>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={onCancel}
                    >
                        {t('my_articles.withdraw.cancel')}
                    </Button>
                    <Button
                        type="button"
                        size="md"
                        disabled={processing}
                        onClick={() => onConfirm(keep)}
                    >
                        {t('my_articles.withdraw.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
