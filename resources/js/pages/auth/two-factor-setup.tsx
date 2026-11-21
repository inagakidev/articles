import { Form, Head, Link } from '@inertiajs/react';
import { Check, Copy, KeyRound, QrCode, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import RecoveryCodes from '@/components/account/recovery-codes';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import CodeInput from '@/components/ui/code-input';
import FormField from '@/components/ui/form-field';
import IconBadge from '@/components/ui/icon-badge';
import { Spinner } from '@/components/ui/spinner';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes/admin';
import { confirm, enable } from '@/routes/two-factor';

type Step = 'start' | 'scan' | 'recovery';

const steps: Step[] = ['start', 'scan', 'recovery'];

type Props = {
    step: Step;
    /** SVG do QR code, gerado pelo Fortify no servidor. */
    qrCodeSvg: string | null;
    secretKey: string | null;
    /** Só logo depois da confirmação; não aparecem de novo. */
    recoveryCodes: string[];
};

/**
 * Ativação do 2FA antes do primeiro acesso ao painel (RF-017, D75): ligar,
 * escanear e confirmar com o código, guardar os códigos de recuperação.
 */
export default function TwoFactorSetup({
    step,
    qrCodeSvg,
    secretKey,
    recoveryCodes,
}: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('account.two_factor.setup.title')} />

            <StepDots current={step} />

            {step === 'start' && <Start />}
            {step === 'scan' && (
                <Scan qrCodeSvg={qrCodeSvg ?? ''} secretKey={secretKey ?? ''} />
            )}
            {step === 'recovery' && <Recovery codes={recoveryCodes} />}
        </>
    );
}

function StepDots({ current }: { current: Step }) {
    const { t } = useTranslation();
    const index = steps.indexOf(current);

    return (
        <div className="flex flex-col items-center gap-2">
            <ol aria-hidden="true" className="flex gap-1.5">
                {steps.map((step, position) => (
                    <li
                        key={step}
                        className={cn(
                            'h-1.5 rounded-full transition-[width,background-color] duration-(--duration-slow) ease-emphasized',
                            position === index ? 'w-8 bg-primary' : 'w-1.5',
                            position < index && 'bg-primary',
                            position > index && 'bg-border',
                        )}
                    />
                ))}
            </ol>
            <p className="text-caption font-bold text-text-secondary">
                {t('account.two_factor.setup.step', {
                    current: index + 1,
                    total: steps.length,
                })}
            </p>
        </div>
    );
}

function Start() {
    const { t } = useTranslation();

    return (
        <>
            <IconBadge Icon={ShieldCheck} />
            <AuthCardHeader
                title={t('account.two_factor.setup.title')}
                description={t('account.two_factor.setup.start.description')}
            />
            <p className="text-meta text-text-secondary">
                {t('account.two_factor.setup.start.apps')}
            </p>
            <Form {...enable.form()} className="w-full">
                {({ processing }) => (
                    <Button
                        type="submit"
                        size="xl"
                        className="w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        {t('account.two_factor.setup.start.submit')}
                    </Button>
                )}
            </Form>
        </>
    );
}

function Scan({
    qrCodeSvg,
    secretKey,
}: {
    qrCodeSvg: string;
    secretKey: string;
}) {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [copied, copy] = useClipboard();

    return (
        <>
            <IconBadge Icon={QrCode} />
            <AuthCardHeader
                title={t('account.two_factor.setup.scan.title')}
                description={t('account.two_factor.setup.scan.description')}
            />

            {/* O QR fica sempre em fundo claro, para a câmera ler nos dois temas. */}
            <div
                role="img"
                aria-label={t('account.two_factor.setup.scan.qr_label')}
                className="rounded-lg bg-brand-paper p-3 shadow-sm ring-1 ring-border [&_svg]:size-44"
                // SVG gerado pelo Fortify no servidor, sem dado de quem usa.
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            />

            <div className="flex w-full flex-col items-center gap-2">
                <p className="text-meta text-text-secondary">
                    {t('account.two_factor.setup.scan.manual')}
                </p>
                <div className="flex w-full max-w-90 items-center gap-2 rounded-md bg-surface-muted py-1.5 pr-1.5 pl-3.5">
                    <code className="min-w-0 flex-1 truncate text-left font-mono text-meta font-bold tracking-wider">
                        {secretKey}
                    </code>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void copy(secretKey)}
                    >
                        {copied === secretKey ? (
                            <Check aria-hidden="true" />
                        ) : (
                            <Copy aria-hidden="true" />
                        )}
                        {t(
                            copied === secretKey
                                ? 'account.two_factor.setup.scan.copied'
                                : 'account.two_factor.setup.scan.copy',
                        )}
                    </Button>
                </div>
            </div>

            <Form
                {...confirm.form()}
                errorBag="confirmTwoFactorAuthentication"
                resetOnError
                onError={() => setCode('')}
                className="flex w-full flex-col gap-4 text-left"
            >
                {({ processing, errors }) => (
                    <>
                        <FormField
                            id="code"
                            label={t(
                                'account.two_factor.setup.scan.code_label',
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
                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t('account.two_factor.setup.scan.submit')}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

function Recovery({ codes }: { codes: string[] }) {
    const { t } = useTranslation();
    const [saved, setSaved] = useState(false);

    return (
        <>
            <IconBadge Icon={KeyRound} />
            <AuthCardHeader
                title={t('account.two_factor.setup.recovery.title')}
                description={t('account.two_factor.setup.recovery.description')}
            />

            <RecoveryCodes codes={codes} />

            <p className="text-meta text-text-secondary">
                {t('account.two_factor.setup.recovery.once')}
            </p>

            <label
                htmlFor="saved"
                className="flex w-full cursor-pointer items-start gap-2.5 text-left text-[0.9375rem]/[1.375rem]"
            >
                <input
                    id="saved"
                    type="checkbox"
                    checked={saved}
                    onChange={(event) => setSaved(event.target.checked)}
                    className="mt-px size-5 shrink-0 accent-primary"
                />
                <span>{t('account.two_factor.setup.recovery.saved')}</span>
            </label>

            {saved ? (
                <Button asChild size="xl" className="w-full">
                    <Link href={dashboard()}>
                        {t('account.two_factor.setup.recovery.submit')}
                    </Link>
                </Button>
            ) : (
                <Button type="button" size="xl" className="w-full" disabled>
                    {t('account.two_factor.setup.recovery.submit')}
                </Button>
            )}
        </>
    );
}

TwoFactorSetup.layout = { variant: 'card' } satisfies AuthLayoutProps;
