import type { ReactNode } from 'react';
import type { MascotArt } from '@/components/ui/mascot';
import Mascot from '@/components/ui/mascot';
import MascotOrbit from '@/components/ui/mascot-orbit';
import SiteLogo from '@/components/site/site-logo';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';

type Common = {
    /** Pose do mascote (DESIGN §5.3). Sem arte, a página fica sem mascote. */
    art?: MascotArt;
};

/** Mascote ao lado do formulário (entrar, criar conta). Textos por chave de tradução. */
type PanelProps = Common & {
    variant: 'panel';
    title: TranslationKey;
    description?: TranslationKey;
    /** Frase grande ao lado do mascote. */
    headline?: TranslationKey;
    /** Texto de apoio abaixo da chamada. */
    support?: TranslationKey;
};

/** Cartão centralizado. Recebe texto pronto até as telas dele serem traduzidas. */
type CardProps = Common & {
    variant?: 'card';
    title?: string;
    description?: string;
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

function AuthHeading({
    title,
    description,
}: Pick<CardProps, 'title' | 'description'>) {
    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-h2 font-extrabold">{title}</h1>
            {description && (
                <p className="text-body text-text-secondary">{description}</p>
            )}
        </div>
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
                {/* Termos de uso e Privacidade entram aqui com as páginas (fatia 4) */}
                <span />
            </aside>

            {/* Celular: palco com o mascote e o formulário numa folha por cima */}
            <div className="flex flex-col bg-surface-muted pb-10 lg:hidden">
                <header className="flex h-15 items-center px-4">
                    <SiteLogo height={31} />
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

            <main className="relative -mt-6 flex flex-1 items-start justify-center rounded-t-xl bg-bg px-5 pt-7 pb-8 lg:mt-0 lg:items-center lg:rounded-none lg:px-8 lg:py-12">
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

function CardLayout({
    title,
    description,
    art,
    children,
}: CardProps & { children: ReactNode }) {
    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary">
            <header className="border-b border-border">
                <div className="flex h-18 items-center px-4 sm:px-8">
                    <SiteLogo />
                </div>
            </header>
            <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:px-6 sm:pt-16">
                <div className="flex w-full max-w-lg flex-col gap-5 sm:rounded-xl sm:border sm:border-border sm:bg-surface sm:px-11 sm:py-10 sm:shadow-md">
                    {art && (
                        <Mascot art={art} size={170} className="self-center" />
                    )}
                    <div className="text-center">
                        <AuthHeading title={title} description={description} />
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
