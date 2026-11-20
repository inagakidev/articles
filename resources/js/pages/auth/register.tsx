import { Form, Head } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { useUsernameAvailability } from '@/hooks/use-username-availability';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import EmailInput from '@/components/ui/email-input';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import PasswordInput from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import { login } from '@/routes';
import { privacy, terms } from '@/routes/policies';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const check = useUsernameAvailability(username);

    return (
        <>
            <Head title={t('account.register.title')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <FormField
                            id="name"
                            label={t('account.name')}
                            error={errors.name}
                        >
                            {(field) => (
                                <Input
                                    {...field}
                                    name="name"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                />
                            )}
                        </FormField>

                        <FormField
                            id="username"
                            label={t('account.username')}
                            error={errors.username}
                            hint={
                                // O resultado da consulta é anunciado sem tirar o foco do campo.
                                <span aria-live="polite">
                                    <UsernameHint check={check} />
                                </span>
                            }
                        >
                            {(field) => (
                                <Input
                                    {...field}
                                    name="username"
                                    required
                                    maxLength={30}
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    value={username}
                                    onChange={(event) =>
                                        setUsername(
                                            event.target.value.toLowerCase(),
                                        )
                                    }
                                />
                            )}
                        </FormField>

                        <FormField
                            id="email"
                            label={t('account.email')}
                            error={errors.email}
                        >
                            {(field) => (
                                <EmailInput
                                    {...field}
                                    name="email"
                                    required
                                    autoComplete="email"
                                />
                            )}
                        </FormField>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                id="password"
                                label={t('account.password')}
                                error={errors.password}
                                hint={t('account.password.hint')}
                            >
                                {(field) => (
                                    <PasswordInput
                                        {...field}
                                        name="password"
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        passwordrules={passwordRules}
                                    />
                                )}
                            </FormField>

                            <FormField
                                id="password_confirmation"
                                label={t('account.password.confirm')}
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
                        </div>

                        <fieldset className="mt-1 flex flex-col gap-3">
                            <legend className="sr-only">
                                {t('account.register.declarations')}
                            </legend>
                            <Declaration
                                name="age_confirmed"
                                error={errors.age_confirmed}
                            >
                                {t('account.register.age')}
                            </Declaration>
                            <Declaration
                                name="policies_accepted"
                                error={errors.policies_accepted}
                            >
                                <PoliciesSentence />
                            </Declaration>
                        </fieldset>

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            {t('account.register.submit')}
                        </Button>
                    </>
                )}
            </Form>

            <p className="text-center text-[0.9375rem] text-text-secondary">
                {t('account.register.has_account')}{' '}
                <TextLink href={login()} className="font-bold">
                    {t('account.register.login')}
                </TextLink>
            </p>
        </>
    );
}

function UsernameHint({
    check,
}: {
    check: ReturnType<typeof useUsernameAvailability>;
}) {
    const { t } = useTranslation();

    switch (check.status) {
        case 'checking':
            return <span>{t('account.username.checking')}</span>;
        case 'available':
            return (
                <span className="flex items-center gap-1.5 text-meta font-semibold text-success-fg">
                    <CircleCheck
                        aria-hidden="true"
                        className="size-4 shrink-0"
                    />
                    {t('account.username.available', {
                        username: check.username,
                    })}
                </span>
            );
        case 'unavailable':
            return (
                <span className="text-meta font-semibold text-danger-fg">
                    {check.message}
                </span>
            );
        default:
            return null;
    }
}

/** Caixa de declaração das pranchas: obrigatória, com o erro logo abaixo. */
function Declaration({
    name,
    error,
    children,
}: {
    name: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={name}
                className="flex cursor-pointer items-start gap-2.5 text-[0.9375rem]/[1.375rem]"
            >
                <input
                    id={name}
                    type="checkbox"
                    name={name}
                    value="1"
                    required
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${name}-error` : undefined}
                    className="mt-px size-5 shrink-0 accent-primary"
                />
                <span>{children}</span>
            </label>
            <InputError id={`${name}-error`} message={error} />
        </div>
    );
}

/** "Li e aceito os Termos de uso e a Política de privacidade." com os links. */
function PoliciesSentence() {
    const { t } = useTranslation();
    const parts = t('account.register.policies').split(/(:terms|:privacy)/);

    return (
        <>
            {parts.map((part, index) => {
                if (part === ':terms' || part === ':privacy') {
                    const isTerms = part === ':terms';

                    return (
                        <a
                            key={index}
                            href={(isTerms ? terms() : privacy()).url}
                            target="_blank"
                            rel="noopener"
                            className="font-bold text-primary-text underline underline-offset-4"
                        >
                            {t(isTerms ? 'policies.terms' : 'policies.privacy')}
                            <span className="sr-only">
                                {' '}
                                ({t('common.new_tab')})
                            </span>
                        </a>
                    );
                }

                return part;
            })}
        </>
    );
}

Register.layout = {
    variant: 'panel',
    art: 'apresentando',
    headline: 'account.register.headline',
    support: 'account.register.support',
    title: 'account.register.title',
    description: 'account.register.description',
} satisfies AuthLayoutProps;
