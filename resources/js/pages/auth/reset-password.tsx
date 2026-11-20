import { Form, Head } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { request, update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

/**
 * Nova senha pelo link do e-mail. Não há prancha desta tela: ela segue o
 * cartão de "Recuperar senha" e os mesmos componentes (D69).
 */
export default function ResetPassword({ token, email, passwordRules }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('account.reset.title')} />

            <AuthCardHeader
                art="pensativo"
                title={t('account.reset.title')}
                description={t('account.reset.description')}
            />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex w-full flex-col gap-4 text-left"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Link inválido ou vencido: o broker devolve o erro no e-mail */}
                        {errors.email && (
                            <Alert variant="danger">
                                <CircleAlert aria-hidden="true" />
                                <AlertDescription>
                                    {errors.email}{' '}
                                    <TextLink href={request()}>
                                        {t('account.forgot.submit')}
                                    </TextLink>
                                </AlertDescription>
                            </Alert>
                        )}

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
                                autoComplete="username"
                                value={email}
                                readOnly
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="password"
                                className="text-meta font-bold"
                            >
                                {t('account.reset.password')}
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoFocus
                                autoComplete="new-password"
                                passwordrules={passwordRules}
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

                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-meta font-bold"
                            >
                                {t('account.reset.confirm')}
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                                aria-invalid={
                                    errors.password_confirmation
                                        ? true
                                        : undefined
                                }
                                aria-describedby={
                                    errors.password_confirmation
                                        ? 'password-confirmation-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="password-confirmation-error"
                                message={errors.password_confirmation}
                            />
                        </div>

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            {t('account.reset.submit')}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = { variant: 'card' } satisfies AuthLayoutProps;
