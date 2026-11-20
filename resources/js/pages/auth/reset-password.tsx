import { Form, Head } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
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

                        <FormField id="email" label={t('account.email')}>
                            {(field) => (
                                <Input
                                    {...field}
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    value={email}
                                    readOnly
                                />
                            )}
                        </FormField>

                        <FormField
                            id="password"
                            label={t('account.reset.password')}
                            error={errors.password}
                            hint={t('account.password.hint')}
                        >
                            {(field) => (
                                <PasswordInput
                                    {...field}
                                    name="password"
                                    required
                                    autoFocus
                                    minLength={8}
                                    autoComplete="new-password"
                                    passwordrules={passwordRules}
                                />
                            )}
                        </FormField>

                        <FormField
                            id="password_confirmation"
                            label={t('account.reset.confirm')}
                            error={errors.password_confirmation}
                        >
                            {(field) => (
                                <PasswordInput
                                    {...field}
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    passwordrules={passwordRules}
                                />
                            )}
                        </FormField>

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
