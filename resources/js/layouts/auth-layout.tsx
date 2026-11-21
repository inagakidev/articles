import type { ReactNode } from 'react';
import type { MascotArt } from '@/components/ui/mascot';
import Mascot from '@/components/ui/mascot';
import MascotOrbit from '@/components/ui/mascot-orbit';
import MotionToggle from '@/components/ui/motion-toggle';
import SiteLogo from '@/components/site/site-logo';
import TextLink from '@/components/ui/text-link';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { privacy, terms } from '@/routes/policies';

/** Mascote ao lado do formulário (entrar, criar conta). Textos por chave de tradução. */
type PanelProps = {
    variant: 'panel';
    /** Pose do mascote (DESIGN §5.3). */
    art?: MascotArt;
    title: TranslationKey;
    description?: TranslationKey;
    /** Frase grande ao lado do mascote. */
    headline?: TranslationKey;
    /** Texto de apoio abaixo da chamada. */
    support?: TranslationKey;
};

/**
 * Cartão centralizado (recuperar senha e as telas curtas). O layout é só a
 * moldura: cada página monta o topo com `AuthCardHeader`, porque o mascote e
 * o título mudam com o estado (pedir o link, link enviado).
 */
type CardProps = {
    variant?: 'card';
};

/** O que cada página declara em `Page.layout` (use com `satisfies`). */
export type AuthLayoutProps = PanelProps | CardProps;

type Props = AuthLayoutProps & { children: ReactNode };

export default function AuthLayout(props: Props) {
    return props.variant === 'panel' ? (
        <PanelLayout {...props} />
    ) : (
        <CardLayout {...props} />
    );
}

function PanelLayout({
    title,
    description,
    art,
    headline,
    support,
    children,
}: PanelProps & { children: ReactNode }) {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary lg:flex-row">
            <aside className="relative hidden min-h-svh flex-1 flex-col justify-between overflow-hidden bg-surface-muted px-14 pt-10 pb-14 lg:flex">
                <SiteLogo height={36} className="relative self-start" />
                <div aria-hidden="true" className="dot-grid absolute inset-0" />
                <div className="relative flex flex-col items-center gap-3 text-center">
                    {art && (
                        <MascotOrbit>
                            <Mascot art={art} size={220} />
                        </MascotOrbit>
                    )}
                    {headline && (
                        <p className="max-w-[420px] font-display text-h2 font-extrabold tracking-normal">
                            {t(headline)}
                        </p>
                    )}
                    {support && (
                        <p className="max-w-[420px] text-[1.0625rem]/[1.6875rem] text-text-secondary">
                            {t(support)}
                        </p>
                    )}
                </div>
                <div className="relative flex flex-wrap items-center gap-4 text-meta font-semibold">
                    <TextLink href={terms()}>{t('policies.terms')}</TextLink>
                    <TextLink href={privacy()}>
                        {t('policies.privacy')}
                    </TextLink>
                    <MotionToggle className="ml-auto" />
                </div>
            </aside>

            {/* Celular: palco com o mascote e o formulário numa folha por cima */}
            <div className="flex flex-col bg-surface-muted pb-10 lg:hidden">
                <header className="flex h-15 items-center justify-between pr-2 pl-4">
                    <SiteLogo height={31} />
                    {art && <MotionToggle />}
                </header>
                {art && (
                    <div className="flex flex-col items-center gap-1 text-center">
                        <MascotOrbit size="sm">
                            <Mascot art={art} size={120} />
                        </MascotOrbit>
                        {headline && (
                            <p className="px-6 font-display text-[1.1875rem]/[1.625rem] font-bold">
                                {t(headline)}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <main className="relative -mt-6 flex flex-1 items-start justify-center rounded-t-section bg-bg px-5 pt-7 pb-8 lg:mt-0 lg:items-center lg:rounded-none lg:px-8 lg:py-12">
                <div className="stagger flex w-full max-w-[440px] flex-col gap-[18px] lg:gap-6">
                    <h1 className="font-display text-[2rem]/10 font-extrabold tracking-[-0.02em]">
                        {t(title)}
                    </h1>
                    {description && (
                        <p className="text-body text-text-secondary">
                            {t(description)}
                        </p>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}

function CardLayout({ children }: CardProps & { children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary">
            <header className="flex h-15 items-center px-4 sm:h-18 sm:border-b sm:border-border sm:px-8">
                <SiteLogo height={31} className="sm:hidden" />
                <SiteLogo height={36} className="hidden sm:flex" />
            </header>
            <main className="flex flex-1 items-start justify-center px-5 pt-2 pb-8 sm:px-6 sm:pt-16 sm:pb-24">
                <div className="stagger flex w-full max-w-[520px] flex-col items-center gap-[18px] text-center sm:gap-5 sm:rounded-section sm:border sm:border-border sm:bg-surface sm:px-11 sm:py-10 sm:shadow-md">
                    {children}
                </div>
            </main>
        </div>
    );
}

/** Topo das telas em cartão: mascote, título e texto de apoio. */
export function AuthCardHeader({
    art,
    title,
    description,
}: {
    art?: MascotArt;
    title: string;
    description?: ReactNode;
}) {
    return (
        <>
            {art && <Mascot art={art} size={170} className="animate-float" />}
            <h1 className="font-display text-[1.75rem]/9 font-extrabold tracking-[-0.02em] sm:text-[2rem]/10">
                {title}
            </h1>
            {description && (
                <p className="text-body text-text-secondary">{description}</p>
            )}
        </>
    );
}
