import { Form, Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';
import { useCountdown } from '@/hooks/use-countdown';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { login } from '@/routes';
import { email } from '@/routes/password';

/** Validade do link, em minutos (config/auth.php, passwords.users.expire). */
const LINK_MINUTES = 60;

type Props = {
    /** O e-mail digitado, depois do pedido. A resposta é a mesma com ou sem conta. */
    sentTo?: string | null;
    /** Segundos até poder pedir outro link para o mesmo e-mail. */
    resendAfter?: number | null;
};

export default function ForgotPassword({ sentTo, resendAfter }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('account.forgot.title')} />
            {sentTo ? (
                <LinkSent email={sentTo} resendAfter={resendAfter} />
            ) : (
                <RequestLink />
            )}
        </>
    );
}

function RequestLink() {
    const { t } = useTranslation();

    return (
        <>
            <AuthCardHeader
                art="pensativo"
                title={t('account.forgot.title')}
                description={t('account.forgot.description')}
            />

            <Form
                {...email.form()}
                className="flex w-full flex-col gap-4 text-left"
            >
                {({ processing, errors }) => (
                    <>
                        <FormField
                            id="email"
                            label={t('account.email')}
                            error={errors.email}
                        >
                            {(field) => (
                                <Input
                                    {...field}
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="voce@exemplo.dev"
                                />
                            )}
                        </FormField>

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Send aria-hidden="true" />
                            )}
                            {t('account.forgot.submit')}
                        </Button>
                    </>
                )}
            </Form>

            <TextLink
                href={login()}
                className="inline-flex items-center gap-1.5 text-[0.9375rem] font-bold no-underline"
            >
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t('account.forgot.back')}
            </TextLink>
        </>
    );
}

function LinkSent({
    email: address,
    resendAfter,
}: {
    email: string;
    resendAfter?: number | null;
}) {
    const { t } = useTranslation();
    const { props } = usePage();
    const secondsLeft = useCountdown(resendAfter, props);
    // O e-mail entra em negrito no meio da frase traduzida.
    const [before, after] = t('account.forgot.sent.description', {
        minutes: LINK_MINUTES,
    }).split(':email');

    return (
        <>
            <AuthCardHeader
                art="esperando"
                title={t('account.forgot.sent.title')}
                description={
                    <span role="status">
                        {before}
                        <strong className="text-text-primary">{address}</strong>
                        {after}
                    </span>
                }
            />

            <div className="flex w-full flex-col gap-2.5">
                <Button asChild size="xl" className="w-full">
                    <Link href={login()}>{t('account.forgot.back')}</Link>
                </Button>

                <Form {...email.form()} className="w-full">
                    {({ processing }) => (
                        <>
                            <input type="hidden" name="email" value={address} />
                            <Button
                                type="submit"
                                variant="subtle"
                                size="md"
                                className="w-full"
                                disabled={processing || secondsLeft > 0}
                            >
                                {secondsLeft > 0
                                    ? t('account.forgot.resend_in', {
                                          seconds: secondsLeft,
                                      })
                                    : t('account.forgot.resend')}
                            </Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ForgotPassword.layout = { variant: 'card' } satisfies AuthLayoutProps;
