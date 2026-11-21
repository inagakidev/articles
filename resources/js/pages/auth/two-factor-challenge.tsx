import { Form, Head } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import CodeInput from '@/components/ui/code-input';
import FormField from '@/components/ui/form-field';
import IconBadge from '@/components/ui/icon-badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { login } from '@/routes';
import { store } from '@/routes/two-factor/login';

/**
 * Segunda etapa do login de quem tem 2FA (RF-017): o código do app ou, sem
 * o aparelho, um código de recuperação. Os dois modos usam o mesmo envio.
 */
export default function TwoFactorChallenge() {
    const { t } = useTranslation();
    const [recovery, setRecovery] = useState(false);
    const [code, setCode] = useState('');

    return (
        <>
            <Head title={t('account.two_factor.challenge.title')} />

            <IconBadge Icon={recovery ? KeyRound : ShieldCheck} />
            <AuthCardHeader
                title={t('account.two_factor.challenge.title')}
                description={t(
                    recovery
                        ? 'account.two_factor.challenge.recovery_description'
                        : 'account.two_factor.challenge.description',
                )}
            />

            <Form
                {...store.form()}
                resetOnError
                className="flex w-full flex-col gap-4 text-left"
            >
                {({ processing, errors, clearErrors }) => (
                    <>
                        {recovery ? (
                            <FormField
                                id="recovery_code"
                                label={t(
                                    'account.two_factor.challenge.recovery_label',
                                )}
                                error={errors.recovery_code}
                            >
                                {(field) => (
                                    <Input
                                        {...field}
                                        name="recovery_code"
                                        required
                                        autoFocus
                                        autoComplete="off"
                                        spellCheck={false}
                                        className="h-12 font-mono"
                                    />
                                )}
                            </FormField>
                        ) : (
                            <FormField
                                id="code"
                                label={t(
                                    'account.two_factor.challenge.code_label',
                                )}
                                error={errors.code}
                                className="items-center text-center"
                            >
                                {(field) => (
                                    <CodeInput
                                        name="code"
                                        value={code}
                                        onChange={setCode}
                                        disabled={processing}
                                        field={field}
                                    />
                                )}
                            </FormField>
                        )}

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t('account.two_factor.challenge.submit')}
                        </Button>

                        <Button
                            type="button"
                            variant="subtle"
                            size="md"
                            className="w-full"
                            onClick={() => {
                                setRecovery(!recovery);
                                setCode('');
                                clearErrors();
                            }}
                        >
                            {t(
                                recovery
                                    ? 'account.two_factor.challenge.use_app'
                                    : 'account.two_factor.challenge.use_recovery',
                            )}
                        </Button>

                        <TextLink
                            href={login()}
                            className="self-center text-meta font-bold"
                        >
                            {t('account.forgot.back')}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

TwoFactorChallenge.layout = { variant: 'card' } satisfies AuthLayoutProps;
