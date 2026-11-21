import { Form, Head, Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import AvatarField from '@/components/account/avatar-field';
import SettingsSection from '@/components/account/settings-section';
import UsernameHint from '@/components/account/username-hint';
import { Button } from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import Textarea from '@/components/ui/textarea';
import { useUsernameAvailability } from '@/hooks/use-username-availability';
import { useTranslation } from '@/lib/i18n';
import { update } from '@/routes/profile';
import { show } from '@/routes/profiles';

type Props = {
    profile: {
        name: string;
        username: string;
        bio: string | null;
        avatar: string | null;
    };
    bioMax: number;
};

/** "Conta e perfil": o perfil público (RF-025, RF-026). */
export default function Profile({ profile, bioMax }: Props) {
    const { t } = useTranslation();
    const [bio, setBio] = useState(profile.bio ?? '');

    return (
        <>
            <Head title={t('settings.nav.profile')} />

            <SettingsSection
                id="profile"
                title={t('settings.profile.title')}
                description={t('settings.profile.description')}
            >
                <AvatarField name={profile.name} avatar={profile.avatar} />

                <Form
                    {...update.form()}
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    id="name"
                                    label={t('settings.profile.name')}
                                    error={errors.name}
                                >
                                    {(field) => (
                                        <Input
                                            {...field}
                                            name="name"
                                            defaultValue={profile.name}
                                            required
                                            autoComplete="name"
                                        />
                                    )}
                                </FormField>
                                <UsernameField
                                    current={profile.username}
                                    error={errors.username}
                                />
                            </div>
                            <FormField
                                id="bio"
                                label={t('settings.profile.bio')}
                                error={errors.bio}
                                hint={t('settings.profile.bio_hint', {
                                    count: bio.length,
                                    max: bioMax,
                                })}
                            >
                                {(field) => (
                                    <Textarea
                                        {...field}
                                        name="bio"
                                        rows={3}
                                        maxLength={bioMax}
                                        value={bio}
                                        onChange={(event) =>
                                            setBio(event.target.value)
                                        }
                                    />
                                )}
                            </FormField>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    type="submit"
                                    size="md"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    {t('settings.profile.submit')}
                                </Button>
                                <Button asChild variant="subtle" size="md">
                                    <Link
                                        href={show({
                                            username: profile.username,
                                        })}
                                    >
                                        <ExternalLink aria-hidden="true" />
                                        {t('settings.profile.view')}
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsSection>
        </>
    );
}

/** Username com a checagem de disponibilidade enquanto digita (RF-029). */
function UsernameField({
    current,
    error,
}: {
    current: string;
    error?: string;
}) {
    const { t } = useTranslation();
    const [value, setValue] = useState(current);
    const availability = useUsernameAvailability(
        value === current ? '' : value,
    );

    return (
        <FormField
            id="username"
            label={t('settings.profile.username')}
            error={error}
            hint={
                value !== current && availability.status !== 'idle' ? (
                    <UsernameHint check={availability} />
                ) : (
                    t('settings.profile.username_hint')
                )
            }
        >
            {(field) => (
                <Input
                    {...field}
                    name="username"
                    value={value}
                    onChange={(event) =>
                        setValue(event.target.value.toLowerCase())
                    }
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                />
            )}
        </FormField>
    );
}
