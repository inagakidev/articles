import type { ReactNode } from 'react';
import type { ArteDoMascote } from '@/components/mascote';
import Mascote from '@/components/mascote';
import SiteLogo from '@/components/site/site-logo';
import type { ChaveDeTraducao } from '@/lib/i18n';
import { useTraducao } from '@/lib/i18n';

type Props = {
    title?: string;
    description?: string;
    /** "painel": mascote ao lado do formulário (entrar, criar conta). "cartao": cartão centralizado. */
    variante?: 'painel' | 'cartao';
    /** Pose do mascote (DESIGN §5.3). Sem arte, a página fica sem mascote. */
    arte?: ArteDoMascote;
    /** Frase grande ao lado do mascote, só na variante "painel". */
    chamada?: ChaveDeTraducao;
    /** Texto de apoio abaixo da chamada. */
    apoio?: ChaveDeTraducao;
    children: ReactNode;
};

export default function AuthLayout({ variante = 'cartao', ...props }: Props) {
    return variante === 'painel' ? (
        <PainelLayout {...props} />
    ) : (
        <CartaoLayout {...props} />
    );
}

function Cabecalho({
    title,
    description,
}: Pick<Props, 'title' | 'description'>) {
    return (
        <div className="flex flex-col gap-3">
            <h1 className="text-h2 font-extrabold">{title}</h1>
            {description && (
                <p className="text-body text-text-secondary">{description}</p>
            )}
        </div>
    );
}

function Rabiscos() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 600 900"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 size-full"
        >
            <path
                d="M480 140l6 15 15 6-15 6-6 15-6-15-15-6 15-6z"
                className="fill-primary"
            />
            <path
                d="M80 760c25-20 50 20 75 0s50 20 75 0"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className="stroke-pastel-lavender"
            />
            <circle
                cx="520"
                cy="700"
                r="14"
                fill="none"
                strokeWidth="5"
                className="stroke-pastel-lavender"
            />
            <circle cx="90" cy="220" r="8" className="fill-pastel-lavender" />
        </svg>
    );
}

function PainelLayout({
    title,
    description,
    arte,
    chamada,
    apoio,
    children,
}: Omit<Props, 'variante'>) {
    const { t } = useTraducao();

    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary lg:flex-row">
            <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-surface-muted px-14 pt-10 pb-14 lg:flex">
                <Rabiscos />
                <SiteLogo className="relative self-start" />
                <div className="relative flex flex-col items-center gap-5 text-center">
                    {arte && <Mascote arte={arte} tamanho={300} />}
                    {chamada && (
                        <p className="max-w-md font-display text-h2 font-extrabold">
                            {t(chamada)}
                        </p>
                    )}
                    {apoio && (
                        <p className="max-w-md text-article text-text-secondary">
                            {t(apoio)}
                        </p>
                    )}
                </div>
                <span />
            </aside>

            <header className="px-4 py-4 lg:hidden">
                <SiteLogo tamanho={28} />
            </header>
            {arte && chamada && (
                <div className="mx-4 flex items-center gap-3 rounded-xl bg-surface-muted px-4 py-3 lg:hidden">
                    <Mascote arte={arte} tamanho={110} />
                    <p className="font-display text-card-title font-extrabold">
                        {t(chamada)}
                    </p>
                </div>
            )}

            <main className="flex flex-1 items-start justify-center px-5 py-8 lg:items-center lg:px-8 lg:py-12">
                <div className="flex w-full max-w-md flex-col gap-6">
                    <Cabecalho title={title} description={description} />
                    {children}
                </div>
            </main>
        </div>
    );
}

function CartaoLayout({
    title,
    description,
    arte,
    children,
}: Omit<Props, 'variante'>) {
    return (
        <div className="flex min-h-svh flex-col bg-bg text-text-primary">
            <header className="border-b border-border">
                <div className="flex h-18 items-center px-4 sm:px-8">
                    <SiteLogo />
                </div>
            </header>
            <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:px-6 sm:pt-16">
                <div className="flex w-full max-w-lg flex-col gap-5 sm:rounded-xl sm:border sm:border-border sm:bg-surface sm:px-11 sm:py-10 sm:shadow-md">
                    {arte && (
                        <Mascote
                            arte={arte}
                            tamanho={170}
                            className="self-center"
                        />
                    )}
                    <div className="text-center">
                        <Cabecalho title={title} description={description} />
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
