import { Form, Head } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import IconBadge from '@/components/ui/icon-badge';
import PasswordInput from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { store } from '@/routes/password/confirm';
import { request } from '@/routes/password';

/** Senha de novo antes de uma área sensível, como ativar o 2FA (D75). */
export default function ConfirmPassword() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('account.confirm_password.title')} />

            <IconBadge Icon={LockKeyhole} />
            <AuthCardHeader
                title={t('account.confirm_password.title')}
                description={t('account.confirm_password.description')}
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex w-full flex-col gap-4 text-left"
            >
                {({ processing, errors }) => (
                    <>
                        <FormField
                            id="password"
                            label={t('account.confirm_password.label')}
                            error={errors.password}
                        >
                            {(field) => (
                                <PasswordInput
                                    {...field}
                                    name="password"
                                    required
                                    autoFocus
                                    autoComplete="current-password"
                                />
                            )}
                        </FormField>

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t('account.confirm_password.submit')}
                        </Button>

                        <TextLink
                            href={request()}
                            className="self-center text-meta font-bold"
                        >
                            {t('account.login.forgot')}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = { variant: 'card' } satisfies AuthLayoutProps;
