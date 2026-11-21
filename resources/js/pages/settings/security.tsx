import { Form, Head, Link } from '@inertiajs/react';
import { Clock, KeyRound } from 'lucide-react';
import { useState } from 'react';
import AdminTwoFactor from '@/components/account/admin-two-factor';
import SettingsSection from '@/components/account/settings-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import EmailInput from '@/components/ui/email-input';
import FormField from '@/components/ui/form-field';
import PasswordInput from '@/components/ui/password-input';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import {
    destroy as cancelEmail,
    store as requestEmail,
} from '@/routes/settings/email';
import { update as updatePassword } from '@/routes/user-password';

type Props = {
    email: string;
    pendingEmail: { address: string; expiresAt: string } | null;
    passwordChangedAt: string | null;
    passwordRules: string;
    canManageTwoFactor: boolean;
    twoFactorEnabled?: boolean;
    recoveryCodes?: string[];
};

/** "Privacidade e segurança": e-mail (RF-030), senha (RF-031) e o 2FA da administradora. */
export default function Security(props: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('settings.nav.security')} />

            <EmailSection email={props.email} pending={props.pendingEmail} />
            <PasswordSection
                changedAt={props.passwordChangedAt}
                rules={props.passwordRules}
            />
            {props.canManageTwoFactor && (
                <AdminTwoFactor
                    enabled={props.twoFactorEnabled ?? false}
                    recoveryCodes={props.recoveryCodes ?? []}
                />
            )}
        </>
    );
}

function EmailSection({
    email,
    pending,
}: {
    email: string;
    pending: Props['pendingEmail'];
}) {
    const { t, locale } = useTranslation();
    const deadline = pending
        ? new Intl.DateTimeFormat(locale.replace('_', '-'), {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          }).format(new Date(pending.expiresAt))
        : '';
    const [before, after] = t('settings.email.pending.body', {
        deadline,
    }).split(':email');

    return (
        <SettingsSection id="email" title={t('settings.email.title')}>
            <Form
                {...requestEmail.form()}
                options={{ preserveScroll: true }}
                className="flex flex-col gap-3"
            >
                {({ processing, errors }) => (
                    <>
                        <FormField
                            id="email"
                            label={t('settings.email.label')}
                            error={errors.email}
                            hint={
                                pending ? undefined : t('settings.email.hint')
                            }
                        >
                            {(field) => (
                                <EmailInput
                                    {...field}
                                    name="email"
                                    defaultValue={email}
                                    required
                                    autoComplete="email"
                                />
                            )}
                        </FormField>
                        <Button
                            type="submit"
                            variant="outline"
                            size="md"
                            className="self-start"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t('settings.email.submit')}
                        </Button>
                    </>
                )}
            </Form>

            {pending && (
                <Alert variant="warning" role="status">
                    <Clock aria-hidden="true" />
                    <AlertTitle>{t('settings.email.pending.title')}</AlertTitle>
                    <AlertDescription>
                        <p>
                            {before}
                            <strong>{pending.address}</strong>
                            {after}{' '}
                            <Link
                                href={cancelEmail()}
                                as="button"
                                preserveScroll
                                className="cursor-pointer font-bold underline underline-offset-2"
                            >
                                {t('settings.email.pending.cancel')}
                            </Link>
                        </p>
                    </AlertDescription>
                </Alert>
            )}
        </SettingsSection>
    );
}

function PasswordSection({
    changedAt,
    rules,
}: {
    changedAt: string | null;
    rules: string;
}) {
    const { t, locale } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <SettingsSection
            id="password"
            title={t('settings.password.title')}
            description={
                changedAt
                    ? t('settings.password.changed_at', {
                          date: formatDate(
                              locale,
                              changedAt.slice(0, 10),
                              'medium',
                          ),
                      })
                    : t('settings.password.never')
            }
        >
            {open ? (
                <Form
                    {...updatePassword.form()}
                    options={{ preserveScroll: true }}
                    resetOnError
                    resetOnSuccess
                    onSuccess={() => setOpen(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="current_password"
                                label={t('settings.password.current')}
                                error={errors.current_password}
                            >
                                {(field) => (
                                    <PasswordInput
                                        {...field}
                                        name="current_password"
                                        required
                                        autoFocus
                                        autoComplete="current-password"
                                    />
                                )}
                            </FormField>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id="password"
                                    label={t('settings.password.new')}
                                    error={errors.password}
                                    hint={t('settings.password.new_hint')}
                                >
                                    {(field) => (
                                        <PasswordInput
                                            {...field}
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            passwordrules={rules}
                                        />
                                    )}
                                </FormField>
                                <FormField
                                    id="password_confirmation"
                                    label={t('settings.password.confirm')}
                                    error={errors.password_confirmation}
                                >
                                    {(field) => (
                                        <PasswordInput
                                            {...field}
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            passwordrules={rules}
                                        />
                                    )}
                                </FormField>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="submit"
                                    size="md"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    {t('settings.password.submit')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="subtle"
                                    size="md"
                                    onClick={() => setOpen(false)}
                                >
                                    {t('settings.password.cancel')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="self-start"
                    onClick={() => setOpen(true)}
                >
                    <KeyRound aria-hidden="true" />
                    {t('settings.password.change')}
                </Button>
            )}
        </SettingsSection>
    );
}
