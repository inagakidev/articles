import { Form, Head } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import { Spinner } from '@/components/ui/spinner';
import Textarea from '@/components/ui/textarea';
import { AuthCardHeader } from '@/layouts/auth-layout';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';

/** Limites do texto, iguais aos do servidor (`AppealRequest`). */
const BODY_MIN = 20;
const BODY_MAX = 5000;

type Props = {
    penaltyId: number;
    type: 'suspension' | 'ban';
    policyItem: string;
    reason: string;
    endsAt: string | null;
    deadline: string | null;
    alreadyAppealed: boolean;
    open: boolean;
    /** Endereço assinado do envio. */
    submitUrl: string;
};

/**
 * Contestar a penalidade pelo link do e-mail, sem login (prancha "Contestar
 * suspensão", RF-228 a RF-231): a penalidade e o motivo, um texto, uma vez
 * só, até o fim do prazo. Os erros aparecem no campo.
 */
export default function Appeal({
    type,
    policyItem,
    reason,
    endsAt,
    deadline,
    alreadyAppealed,
    open,
    submitUrl,
}: Props) {
    const { t, locale } = useTranslation();
    const [body, setBody] = useState('');
    const banned = type === 'ban';

    return (
        <>
            <Head
                title={t(
                    banned
                        ? 'account.appeal.title_ban'
                        : 'account.appeal.title',
                )}
            />
            <AuthCardHeader
                title={t(
                    banned
                        ? 'account.appeal.title_ban'
                        : 'account.appeal.title',
                )}
                description={
                    banned
                        ? t('account.appeal.penalty_ban')
                        : t('account.appeal.penalty', {
                              date: endsAt ? shortDate(endsAt, locale) : '',
                          })
                }
            />

            <div className="flex flex-col gap-1.5 rounded-2xl bg-surface-muted px-4 py-3.5 text-meta">
                <span className="font-bold">
                    {t('account.appeal.reason', { item: policyItem })}
                </span>
                <q className="text-text-secondary">{reason}</q>
            </div>

            {alreadyAppealed ? (
                <p
                    role="status"
                    className="flex items-start gap-2.5 rounded-2xl bg-success-bg px-4 py-3.5 text-meta text-success-on-bg"
                >
                    <CircleCheck
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0"
                    />
                    {t('account.appeal.already')}
                </p>
            ) : open ? (
                <Form
                    action={submitUrl}
                    method="post"
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="contestacao"
                                label={t('account.appeal.field')}
                                error={errors.justification}
                                hint={t('account.appeal.hint', {
                                    min: BODY_MIN,
                                    date: deadline
                                        ? shortDate(deadline, locale)
                                        : '',
                                })}
                            >
                                {(field) => (
                                    <Textarea
                                        {...field}
                                        name="justification"
                                        rows={6}
                                        maxLength={BODY_MAX}
                                        value={body}
                                        onChange={(event) =>
                                            setBody(event.target.value)
                                        }
                                        required
                                    />
                                )}
                            </FormField>
                            <Button
                                type="submit"
                                size="xl"
                                className="w-full"
                                disabled={processing || body.trim() === ''}
                            >
                                {processing && <Spinner />}
                                {t('account.appeal.submit')}
                            </Button>
                            <p className="text-center text-meta text-text-secondary">
                                {t('account.appeal.by_email')}
                            </p>
                        </>
                    )}
                </Form>
            ) : (
                <p className="rounded-2xl bg-surface-muted px-4 py-3.5 text-meta text-text-secondary">
                    {t('account.appeal.closed')}
                </p>
            )}
        </>
    );
}
