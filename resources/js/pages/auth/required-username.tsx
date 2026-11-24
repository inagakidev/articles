import { Form, Head } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import UsernameHint from '@/components/account/username-hint';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useUsernameAvailability } from '@/hooks/use-username-availability';
import { AuthCardHeader } from '@/layouts/auth-layout';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { update } from '@/routes/username/required';

/** As regras do username, conferidas enquanto a pessoa digita (RF-027). */
const RULES = [
    {
        key: 'length',
        test: (value: string) => value.length >= 3 && value.length <= 30,
    },
    { key: 'letter', test: (value: string) => /^[a-z]/.test(value) },
    {
        key: 'chars',
        test: (value: string) => value !== '' && /^[a-z0-9_-]+$/.test(value),
    },
] as const;

/**
 * Trocar o username considerado inadequado (prancha "Trocar username
 * obrigatório", RF-178, D91): o motivo, o campo com a disponibilidade e as
 * regras, e o aviso de que o endereço antigo deixa de funcionar.
 */
export default function RequiredUsername({
    username,
    policyItem,
}: {
    username: string;
    policyItem: string | null;
}) {
    const { t } = useTranslation();
    const [value, setValue] = useState('');
    const availability = useUsernameAvailability(value);

    return (
        <>
            <Head title={t('account.required_username.title')} />
            <AuthCardHeader
                art="pensativo"
                title={t('account.required_username.title')}
                description={
                    policyItem
                        ? t('account.required_username.lead', {
                              username,
                              item: policyItem,
                          })
                        : t('account.required_username.lead_plain', {
                              username,
                          })
                }
            />

            <Form {...update.form()} className="flex flex-col gap-4">
                {({ processing, errors }) => (
                    <>
                        <FormField
                            id="username"
                            label={t('account.required_username.field')}
                            error={errors.username}
                            hint={
                                availability.status !== 'idle' ? (
                                    <UsernameHint check={availability} />
                                ) : undefined
                            }
                        >
                            {(field) => (
                                <Input
                                    {...field}
                                    name="username"
                                    value={value}
                                    onChange={(event) =>
                                        setValue(
                                            event.target.value.toLowerCase(),
                                        )
                                    }
                                    required
                                    autoFocus
                                    autoComplete="username"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                />
                            )}
                        </FormField>

                        <ul
                            aria-label={t('account.required_username.rules')}
                            className="flex flex-col gap-1.5 text-meta"
                        >
                            {RULES.map((rule) => {
                                const ok = rule.test(value);

                                return (
                                    <li
                                        key={rule.key}
                                        className={cn(
                                            'flex items-center gap-2',
                                            ok
                                                ? 'text-success-fg'
                                                : 'text-text-secondary',
                                        )}
                                    >
                                        {ok ? (
                                            <Check
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        ) : (
                                            <X
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        )}
                                        {t(
                                            `account.required_username.rule.${rule.key}`,
                                        )}
                                        <span className="sr-only">
                                            {ok
                                                ? t(
                                                      'account.required_username.ok',
                                                  )
                                                : t(
                                                      'account.required_username.pending',
                                                  )}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t('account.required_username.submit')}
                        </Button>
                        <p className="text-center text-meta text-text-secondary">
                            {t('account.required_username.note')}
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}
