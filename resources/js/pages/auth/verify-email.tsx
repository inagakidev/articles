import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { useCountdown } from '@/hooks/use-countdown';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import EmailInput from '@/components/ui/email-input';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { home, logout } from '@/routes';
import { send } from '@/routes/verification';
import { update } from '@/routes/verification/email';

/** Prazo para confirmar o e-mail (User::VERIFICATION_DAYS). */
const VERIFICATION_DAYS = 7;

type Props = {
    email: string;
    /** Segundos até poder reenviar o link. */
    resendAfter?: number | null;
};

/** "0:45": a espera da prancha, em minutos e segundos. */
function clock(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function VerifyEmail({ email, resendAfter }: Props) {
    const { t } = useTranslation();
    const { props } = usePage();
    const secondsLeft = useCountdown(resendAfter, props);
    const [changing, setChanging] = useState(false);
    // O e-mail entra em negrito no meio da frase traduzida.
    const [before, after] = t('account.verify.description').split(':email');

    return (
        <>
            <Head title={t('account.verify.title')} />

            <AuthCardHeader
                art="esperando"
                title={t('account.verify.title')}
                description={
                    <>
                        {before}
                        <strong className="text-text-primary">{email}</strong>
                        {after}
                    </>
                }
            />

            <Alert variant="info" role="status" className="text-left">
                <Info aria-hidden="true" />
                <AlertTitle>{t('account.verify.meanwhile.title')}</AlertTitle>
                <AlertDescription>
                    {t('account.verify.meanwhile.body', {
                        days: VERIFICATION_DAYS,
                    })}
                </AlertDescription>
            </Alert>

            {changing ? (
                <Form
                    {...update.form()}
                    className="flex w-full flex-col gap-4 text-left"
                    onSuccess={() => setChanging(false)}
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="email"
                                label={t('account.verify.new_email')}
                                error={errors.email}
                            >
                                {(field) => (
                                    <EmailInput
                                        {...field}
                                        name="email"
                                        required
                                        autoFocus
                                        autoComplete="email"
                                    />
                                )}
                            </FormField>
                            <div className="flex flex-col gap-2.5">
                                <Button
                                    type="submit"
                                    size="xl"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    {t('account.verify.send_to_new')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="subtle"
                                    size="md"
                                    className="w-full"
                                    onClick={() => setChanging(false)}
                                >
                                    {t('account.verify.cancel')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            ) : (
                <div className="flex w-full flex-col gap-2.5">
                    <Form {...send.form()} className="w-full">
                        {({ processing }) => (
                            <Button
                                type="submit"
                                size="xl"
                                className="w-full"
                                disabled={processing || secondsLeft > 0}
                            >
                                {processing && <Spinner />}
                                {secondsLeft > 0
                                    ? t('account.verify.resend_in', {
                                          time: clock(secondsLeft),
                                      })
                                    : t('account.verify.resend')}
                            </Button>
                        )}
                    </Form>
                    <Button
                        type="button"
                        variant="subtle"
                        size="md"
                        className="w-full"
                        onClick={() => setChanging(true)}
                    >
                        {t('account.verify.other_email')}
                    </Button>
                </div>
            )}

            <p className="text-meta text-text-secondary">
                {t('account.verify.spam')}
            </p>

            {/* Sem confirmar, dá para ler; e quem entrou na conta errada sai daqui. */}
            <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-4 text-meta font-bold">
                <TextLink href={home()}>{t('account.verify.home')}</TextLink>
                <Link
                    href={logout()}
                    as="button"
                    onClick={() => router.flushAll()}
                    className="cursor-pointer rounded-sm text-primary-text underline underline-offset-4 hover:text-text-primary"
                >
                    {t('account.verify.logout')}
                </Link>
            </div>
        </>
    );
}

VerifyEmail.layout = { variant: 'card' } satisfies AuthLayoutProps;
