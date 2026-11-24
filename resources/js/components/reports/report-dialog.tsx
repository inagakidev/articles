import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/ui/input-error';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store } from '@/routes/reports';

export type ReportTarget = 'article' | 'comment' | 'profile';

const REASONS = [
    'spam',
    'offensive',
    'plagiarism',
    'misleading',
    'other',
] as const;

/** Limite dos detalhes, igual ao do servidor (`ReportRequest::DETAILS_MAX`). */
const DETAILS_MAX = 500;

/**
 * Denunciar (prancha "Denunciar", RF-164 a RF-166): o motivo, os detalhes
 * (obrigatórios em "Outro") e o aviso de que o conteúdo segue no ar e de
 * que só o aviso da análise volta.
 */
export default function ReportDialog({
    open,
    onClose,
    target,
    id,
    subject,
}: {
    open: boolean;
    onClose: () => void;
    target: ReportTarget;
    id: number;
    /** O que está sendo denunciado, numa linha ("Artigo “…”, de @rafa"). */
    subject: string;
}) {
    const { t } = useTranslation();
    const form = useForm<{
        target: ReportTarget;
        id: number;
        reason: (typeof REASONS)[number] | '';
        details: string;
    }>({ target, id, reason: '', details: '' });

    function close() {
        form.reset();
        form.clearErrors();
        onClose();
    }

    function send(event: FormEvent) {
        event.preventDefault();
        form.post(store().url, { preserveScroll: true, onSuccess: close });
    }

    const needsDetails = form.data.reason === 'other';

    return (
        <Dialog open={open} onOpenChange={(next) => !next && close()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-card sm:max-w-lg">
                <DialogTitle className="font-display text-h3 font-extrabold">
                    {t(`reports.title.${target}`)}
                </DialogTitle>
                <DialogDescription className="text-meta text-text-secondary">
                    {subject}
                </DialogDescription>

                <form onSubmit={send} className="flex flex-col gap-4">
                    <fieldset className="flex flex-col gap-2">
                        <legend className="mb-2 text-label font-bold">
                            {t('reports.fields.reason')}
                        </legend>
                        {REASONS.map((reason) => (
                            <label
                                key={reason}
                                className={cn(
                                    'flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors',
                                    form.data.reason === reason
                                        ? 'border-primary bg-surface-selected/50'
                                        : 'border-border-strong hover:bg-surface-hover',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    value={reason}
                                    checked={form.data.reason === reason}
                                    onChange={() =>
                                        form.setData('reason', reason)
                                    }
                                    className="mt-1 size-4 accent-primary"
                                />
                                <span className="flex flex-col">
                                    <span className="text-label font-bold">
                                        {t(`reports.reasons.${reason}`)}
                                    </span>
                                    {reason !== 'other' && (
                                        <span className="text-meta text-text-secondary">
                                            {t(
                                                `reports.reasons_hint.${reason}`,
                                            )}
                                        </span>
                                    )}
                                </span>
                            </label>
                        ))}
                        <InputError message={form.errors.reason} />
                    </fieldset>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor={`denuncia-detalhes-${target}-${id}`}
                            className="text-label font-bold"
                        >
                            {t('reports.fields.details')}{' '}
                            {!needsDetails && (
                                <span className="font-normal text-text-secondary">
                                    {t('reports.optional')}
                                </span>
                            )}
                        </label>
                        <textarea
                            id={`denuncia-detalhes-${target}-${id}`}
                            rows={3}
                            maxLength={DETAILS_MAX}
                            required={needsDetails}
                            value={form.data.details}
                            onChange={(event) =>
                                form.setData('details', event.target.value)
                            }
                            aria-invalid={
                                form.errors.details ? true : undefined
                            }
                            className="w-full resize-y rounded-xl border border-border-strong bg-surface px-3.5 py-3 text-body text-text-primary focus-visible:outline-offset-[-1px]"
                        />
                        <InputError message={form.errors.details} />
                    </div>

                    <p className="rounded-xl bg-surface-muted px-3.5 py-3 text-meta text-text-secondary">
                        {t('reports.note')}
                    </p>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="md"
                            onClick={close}
                        >
                            {t('moderation.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            size="md"
                            disabled={
                                form.processing || form.data.reason === ''
                            }
                        >
                            {form.processing && <Spinner />}
                            {t('reports.send')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
