import { Form, Link } from '@inertiajs/react';
import { KeyRound, ShieldCheck, ShieldAlert } from 'lucide-react';
import RecoveryCodes from '@/components/account/recovery-codes';
import SettingsSection from '@/components/account/settings-section';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { show } from '@/routes/admin/two-factor';
import { regenerateRecoveryCodes } from '@/routes/two-factor';

/**
 * 2FA da administradora em Configurações › Segurança (RF-017). Não dá para
 * desligar; dá para gerar novos códigos de recuperação, que aparecem uma
 * vez. As demais pessoas não veem esta seção no MVP (RF-019).
 */
export default function AdminTwoFactor({
    enabled,
    recoveryCodes,
}: {
    enabled: boolean;
    /** Só logo depois de gerar novos códigos. */
    recoveryCodes: string[];
}) {
    const { t } = useTranslation();

    return (
        <SettingsSection
            id="two-factor"
            title={t('settings.two_factor.title')}
            description={t('settings.two_factor.required')}
        >
            {enabled ? (
                <>
                    <p className="inline-flex items-center gap-2 text-meta font-bold text-success-fg">
                        <ShieldCheck aria-hidden="true" className="size-4" />
                        {t('settings.two_factor.active')}
                    </p>

                    {recoveryCodes.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-meta font-bold">
                                {t('settings.two_factor.new_codes')}
                            </p>
                            <RecoveryCodes codes={recoveryCodes} />
                            <p className="text-caption text-text-secondary">
                                {t('settings.two_factor.new_codes_hint')}
                            </p>
                        </div>
                    ) : (
                        <Form
                            {...regenerateRecoveryCodes.form()}
                            className="flex flex-col items-start gap-1.5"
                        >
                            {({ processing }) => (
                                <>
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <KeyRound aria-hidden="true" />
                                        )}
                                        {t('settings.two_factor.regenerate')}
                                    </Button>
                                    <span className="text-caption text-text-secondary">
                                        {t(
                                            'settings.two_factor.regenerate_hint',
                                        )}
                                    </span>
                                </>
                            )}
                        </Form>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-start gap-3">
                    <p className="inline-flex items-center gap-2 text-meta font-bold text-warning-fg">
                        <ShieldAlert aria-hidden="true" className="size-4" />
                        {t('settings.two_factor.inactive')}
                    </p>
                    <Button asChild>
                        <Link href={show()}>
                            {t('settings.two_factor.activate')}
                        </Link>
                    </Button>
                </div>
            )}
        </SettingsSection>
    );
}
