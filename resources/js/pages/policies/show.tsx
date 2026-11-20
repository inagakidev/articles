import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';

type Props = {
    type: 'terms' | 'privacy';
    version: string;
    publishedAt: string;
    draft: boolean;
    /** Texto do documento, versionado no repositório e convertido no servidor. */
    html: string;
};

/**
 * Termos de uso e Política de privacidade (D72). Página simples por
 * enquanto: o visual da prancha entra na fatia 4.
 */
export default function PolicyShow({
    type,
    version,
    publishedAt,
    draft,
    html,
}: Props) {
    const { t, locale } = useTranslation();
    const title = t(type === 'terms' ? 'policies.terms' : 'policies.privacy');
    const date = new Intl.DateTimeFormat(locale.replace('_', '-'), {
        dateStyle: 'long',
        timeZone: 'UTC',
    }).format(new Date(`${publishedAt}T00:00:00Z`));

    return (
        <>
            <Head title={title} />
            <article className="mx-auto flex w-full max-w-reading flex-col gap-6 px-5 py-12 sm:py-16">
                <header className="flex flex-col gap-2">
                    {draft && (
                        <span className="self-start rounded-full bg-tint-warning-bg px-3 py-1 text-badge font-bold text-tint-warning-fg">
                            {t('policies.draft')}
                        </span>
                    )}
                    <h1 className="font-display text-h1 font-extrabold">
                        {title}
                    </h1>
                    <p className="text-meta text-text-secondary">
                        {t('policies.version', { version, date })}
                    </p>
                </header>
                <div
                    className="policy-text flex flex-col gap-4 text-article"
                    // Texto do repositório, sem conteúdo de usuário (PolicyController).
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </article>
        </>
    );
}
