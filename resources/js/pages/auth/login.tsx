import { Form, Head, usePage } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { useCountdown } from '@/hooks/use-countdown';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    /** Segundos até o login voltar, depois de tentativas seguidas. */
    retryAfter?: number | null;
};

export default function Login({ status, canResetPassword, retryAfter }: Props) {
    const { t } = useTranslation();
    const { props } = usePage();
    // Cada resposta do servidor traz props novas: o contador recomeça mesmo
    // quando o número de segundos se repete.
    const secondsLeft = useCountdown(retryAfter, props);
    const locked = secondsLeft > 0;

    return (
        <>
            <Head title={t('account.login.title')} />

            {locked && retryAfter && (
                <LockedAlert announced={retryAfter} seconds={secondsLeft} />
            )}

            {status && (
                <p
                    role="status"
                    className="text-meta font-semibold text-success-fg"
                >
                    {status}
                </p>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        {/* A sessão é sempre lembrada (D68) */}
                        <input type="hidden" name="remember" value="1" />

                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="email"
                                className="text-meta font-bold"
                            >
                                {t('account.email')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                aria-invalid={errors.email ? true : undefined}
                                aria-describedby={
                                    errors.email ? 'email-error' : undefined
                                }
                            />
                            <InputError
                                id="email-error"
                                message={errors.email}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="password"
                                className="text-meta font-bold"
                            >
                                {t('account.password')}
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                aria-invalid={
                                    errors.password ? true : undefined
                                }
                                aria-describedby={
                                    errors.password
                                        ? 'password-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="password-error"
                                message={errors.password}
                            />
                        </div>

                        {canResetPassword && (
                            <TextLink
                                href={request()}
                                className="-mt-1.5 self-end text-meta font-bold"
                            >
                                {t('account.login.forgot')}
                            </TextLink>
                        )}

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={processing || locked}
                            data-test="login-button"
                        >
                            {processing && <Spinner />}
                            {t('account.login.submit')}
                        </Button>
                    </>
                )}
            </Form>

            <p className="text-center text-[0.9375rem] text-text-secondary">
                {t('account.login.no_account')}{' '}
                <TextLink href={register()} className="font-bold">
                    {t('account.login.create_account')}
                </TextLink>
            </p>
        </>
    );
}

/**
 * Aviso do login pausado. O leitor de tela ouve uma vez o prazo inicial; o
 * número que diminui na tela não é anunciado a cada segundo.
 */
function LockedAlert({
    announced,
    seconds,
}: {
    announced: number;
    seconds: number;
}) {
    const { t } = useTranslation();
    const message = (value: number) =>
        value === 1
            ? t('account.login.locked.body_one')
            : t('account.login.locked.body', { seconds: value });

    return (
        <Alert variant="danger">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>{t('account.login.locked.title')}</AlertTitle>
            <AlertDescription>
                <span className="sr-only">{message(announced)}</span>
                <span aria-hidden="true">{message(seconds)}</span>
            </AlertDescription>
        </Alert>
    );
}

Login.layout = {
    variant: 'panel',
    art: 'apresentando',
    headline: 'account.login.headline',
    support: 'account.login.support',
    title: 'account.login.title',
    description: 'account.login.description',
} satisfies AuthLayoutProps;
