import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronRight,
    Clock,
    Code,
    Copyright,
    FileText,
    Globe,
    HeartHandshake,
    History,
    LogOut,
    Mail,
    Megaphone,
    PenLine,
    Printer,
    Scale,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import PolicyBlocks, {
    itemAnchor,
    PolicyTable,
} from '@/components/policies/policy-blocks';
import type { PolicyDocument } from '@/components/policies/types';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import { formatDate } from '@/lib/format';
import type { TranslationKey } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { content, privacy, terms } from '@/routes/policies';

type PolicyKind = 'terms' | 'privacy' | 'content';

type Version = { label: string; publishedAt: string; draft: boolean };

type Props = {
    type: PolicyKind;
    version: Version;
    document: PolicyDocument;
    history: (Version & { changes: string[] })[];
    /** Item da Política de conteúdo citado pela moderação ("4.2"). */
    highlight: string | null;
    /** Contato de privacidade (config/app.php, contacts.privacy). */
    privacyEmail: string;
};

/** Ícones dos cartões de resumo, pelo nome usado no texto da política. */
const summaryIcons: Record<string, LucideIcon> = {
    'user-round': UserRound,
    globe: Globe,
    'shield-check': ShieldCheck,
    'log-out': LogOut,
    clock: Clock,
    'pen-line': PenLine,
    scale: Scale,
    'heart-handshake': HeartHandshake,
    code: Code,
    copyright: Copyright,
    megaphone: Megaphone,
};

const documents: {
    kind: PolicyKind;
    name: TranslationKey;
    short: TranslationKey;
    href: typeof terms;
}[] = [
    {
        kind: 'terms',
        name: 'policies.terms',
        short: 'policies.short.terms',
        href: terms,
    },
    {
        kind: 'content',
        name: 'policies.content',
        short: 'policies.short.content',
        href: content,
    },
    {
        kind: 'privacy',
        name: 'policies.privacy',
        short: 'policies.short.privacy',
        href: privacy,
    },
];

const HISTORY_ID = 'historico';

/** Termos de uso, Política de privacidade e Política de conteúdo (D73). */
export default function PolicyShow({
    type,
    version,
    document,
    history,
    highlight,
    privacyEmail,
}: Props) {
    const { t, locale } = useTranslation();
    const current = documents.find((item) => item.kind === type)!;
    const date = formatDate(locale, version.publishedAt);
    const highlighted = highlight
        ? document.sections.find((section) =>
              section.blocks.some(
                  (block) =>
                      'items' in block &&
                      block.items.some((item) => item.id === highlight),
              ),
          )
        : undefined;
    const activeSection = useActiveSection([
        ...document.sections.map((section) => section.id),
        HISTORY_ID,
    ]);

    return (
        <>
            <Head title={document.title} />

            <div className="mx-auto flex w-full max-w-page flex-col gap-[18px] px-5 pt-5 pb-12 sm:gap-7 sm:px-8 sm:pt-8 sm:pb-24">
                <nav
                    aria-label={t('policies.breadcrumb')}
                    className="hidden text-meta font-semibold text-text-secondary sm:block print:hidden"
                >
                    <ol className="flex items-center gap-2">
                        <li>
                            <Link href={home()} className="text-primary-text">
                                {t('policies.breadcrumb.home')}
                            </Link>
                        </li>
                        <li aria-hidden="true">
                            <ChevronRight className="size-4" />
                        </li>
                        <li>{t('policies.breadcrumb.policies')}</li>
                        <li aria-hidden="true">
                            <ChevronRight className="size-4" />
                        </li>
                        <li aria-current="page" className="text-text-primary">
                            {t(current.name)}
                        </li>
                    </ol>
                </nav>

                <nav
                    aria-label={t('policies.nav')}
                    className="flex flex-wrap gap-2 print:hidden"
                >
                    {documents.map((item) => (
                        <Link
                            key={item.kind}
                            href={item.href()}
                            aria-current={
                                item.kind === type ? 'page' : undefined
                            }
                            aria-label={t(item.name)}
                            className="policy-tab"
                        >
                            <span className="sm:hidden">{t(item.short)}</span>
                            <span className="hidden sm:inline">
                                {t(item.name)}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="grid items-start gap-16 lg:grid-cols-[248px_minmax(0,1fr)]">
                    <aside
                        aria-label={t('policies.on_this_page')}
                        className="sticky top-26 hidden flex-col gap-4 lg:flex print:hidden"
                    >
                        <strong className="px-3 text-caption font-extrabold text-text-secondary">
                            {t('policies.on_this_page')}
                        </strong>
                        <ol className="flex flex-col gap-0.5">
                            {document.sections.map((section, index) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        aria-current={
                                            activeSection === section.id
                                                ? 'location'
                                                : undefined
                                        }
                                        className="policy-toc-link"
                                    >
                                        <span className="min-w-5 text-text-muted">
                                            {index + 1}
                                        </span>
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a
                                    href={`#${HISTORY_ID}`}
                                    aria-current={
                                        activeSection === HISTORY_ID
                                            ? 'location'
                                            : undefined
                                    }
                                    className="policy-toc-link"
                                >
                                    <span className="min-w-5 text-text-muted">
                                        <History
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </span>
                                    {t('policies.history.title')}
                                </a>
                            </li>
                        </ol>
                        <div className="flex flex-col items-start gap-2.5 border-t border-border px-3 pt-4">
                            <span className="text-caption text-text-secondary">
                                {t('policies.in_force_line', {
                                    version: version.label,
                                    date,
                                })}
                            </span>
                            <PrintButton size="sm" />
                        </div>
                    </aside>

                    <article className="policy-doc max-w-[780px] min-w-0">
                        <header className="mb-5 flex flex-col gap-3 sm:mb-8 sm:gap-3.5">
                            {version.draft && (
                                <span className="self-start rounded-full bg-tint-warning-bg px-3 py-1 text-badge font-bold text-tint-warning-fg">
                                    {t('policies.draft')}
                                </span>
                            )}
                            <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em] sm:text-[2.75rem]/[3.25rem]">
                                {document.title}
                            </h1>
                            <p className="text-body text-text-secondary sm:text-[1.1875rem]/[1.8125rem]">
                                {document.description}
                            </p>
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-meta font-semibold text-text-secondary">
                                <span className="inline-flex items-center gap-1.5">
                                    <FileText
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    {t('policies.version_label', {
                                        version: version.label,
                                    })}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    {t('policies.in_force', { date })}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    {t('policies.reading', {
                                        minutes: document.readingMinutes,
                                    })}
                                </span>
                            </div>
                            <PrintButton
                                size="md"
                                className="self-start lg:hidden"
                            />
                        </header>

                        {highlight && highlighted && (
                            <div role="status" className="policy-note mb-6">
                                <span className="flex flex-col gap-0.5">
                                    <strong>
                                        {t('policies.highlight.title', {
                                            item: highlight,
                                        })}
                                    </strong>
                                    <span>
                                        {t('policies.highlight.body', {
                                            section: highlighted.title,
                                        })}{' '}
                                        <a href={`#${itemAnchor(highlight)}`}>
                                            {t('policies.highlight.go', {
                                                item: highlight,
                                            })}
                                        </a>
                                    </span>
                                </span>
                            </div>
                        )}

                        <section
                            aria-labelledby="resumo-h"
                            className="flex items-start gap-6 rounded-xl bg-surface-muted p-5 sm:px-7 sm:py-6"
                        >
                            <div className="flex min-w-0 flex-1 flex-col gap-3.5">
                                <div className="flex flex-col gap-0.5">
                                    <h2
                                        id="resumo-h"
                                        className="font-display text-card-title font-extrabold"
                                    >
                                        {t('policies.summary.title')}
                                    </h2>
                                    <span className="text-meta text-text-secondary">
                                        {t('policies.summary.note')}
                                    </span>
                                </div>
                                <ul className="grid list-none gap-x-6 gap-y-3.5 p-0 sm:grid-cols-2">
                                    {document.summary.map((item) => {
                                        const Icon =
                                            summaryIcons[item.icon] ?? FileText;

                                        return (
                                            <li
                                                key={item.title}
                                                className="flex items-start gap-3"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface text-primary-text"
                                                >
                                                    <Icon className="size-[18px]" />
                                                </span>
                                                <span className="flex flex-col gap-0.5">
                                                    <strong className="text-[0.9375rem]/[1.375rem]">
                                                        {item.title}
                                                    </strong>
                                                    <span className="text-meta text-text-secondary">
                                                        {item.text}
                                                    </span>
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <Mascot
                                art="lendo"
                                size={112}
                                className="hidden self-end sm:block print:hidden"
                            />
                        </section>

                        {document.sections.map((section, index) => (
                            <section
                                key={section.id}
                                id={section.id}
                                aria-labelledby={`${section.id}-h`}
                                className="policy-section"
                            >
                                <h2 id={`${section.id}-h`}>
                                    <span className="number">{index + 1}.</span>
                                    {section.title}
                                </h2>
                                <PolicyBlocks
                                    blocks={section.blocks}
                                    highlight={highlight}
                                />
                            </section>
                        ))}

                        <section
                            id={HISTORY_ID}
                            aria-labelledby={`${HISTORY_ID}-h`}
                            className="policy-section"
                        >
                            <h2 id={`${HISTORY_ID}-h`}>
                                <span className="number">
                                    <History
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </span>
                                {t('policies.history.title')}
                            </h2>
                            <PolicyTable
                                caption={t('policies.history.caption')}
                                columns={[
                                    t('policies.history.version'),
                                    t('policies.history.since'),
                                    t('policies.history.changes'),
                                ]}
                                rows={history.map((item) => [
                                    item.label,
                                    formatDate(
                                        locale,
                                        item.publishedAt,
                                        'medium',
                                    ),
                                    item.changes.join(' '),
                                ])}
                            />
                            {history.length === 1 && (
                                <p className="text-[0.9375rem] text-text-secondary">
                                    {t('policies.history.note')}
                                </p>
                            )}
                        </section>

                        <HelpCard email={privacyEmail} />
                    </article>
                </div>
            </div>
        </>
    );
}

/** "Ficou com alguma dúvida?": o contato de privacidade até o pedido de dados existir. */
function HelpCard({ email }: { email: string }) {
    const { t } = useTranslation();
    const [before, after] = t('policies.help.body').split(':email');

    return (
        <aside
            aria-labelledby="ajuda-h"
            className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border border-border bg-surface px-7 py-6 print:hidden"
        >
            <Mascot art="esperando" size={96} />
            <div className="flex flex-[1_1_260px] flex-col gap-1">
                <h2
                    id="ajuda-h"
                    className="font-display text-card-title font-extrabold"
                >
                    {t('policies.help.title')}
                </h2>
                <p className="m-0 text-[0.9375rem]/[1.4375rem] text-text-secondary">
                    {before}
                    <a href={`mailto:${email}`} className="font-bold">
                        {email}
                    </a>
                    {after}
                </p>
            </div>
            <Button asChild size="md" className="font-bold">
                <a href={`mailto:${email}`}>
                    <Mail aria-hidden="true" />
                    {t('policies.help.action')}
                </a>
            </Button>
        </aside>
    );
}

function PrintButton({
    size,
    className,
}: {
    size: 'sm' | 'md';
    className?: string;
}) {
    const { t } = useTranslation();

    return (
        <Button
            type="button"
            variant="outline"
            size={size}
            className={cn('font-bold print:hidden', className)}
            onClick={() => window.print()}
        >
            <Printer aria-hidden="true" />
            {t('policies.print')}
        </Button>
    );
}

/** A seção que está no topo da tela, para marcar no índice "Nesta página". */
function useActiveSection(ids: string[]): string | undefined {
    const [active, setActive] = useState<string | undefined>(ids[0]);
    const key = ids.join(',');

    useEffect(() => {
        const targets = key
            .split(',')
            .map((id) => window.document.getElementById(id))
            .filter((element): element is HTMLElement => element !== null);

        if (!('IntersectionObserver' in window) || targets.length === 0) {
            return;
        }

        // Seções na faixa de leitura (logo abaixo do topo); marca a primeira na ordem do texto.
        const visible = new Set<string>();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) =>
                    entry.isIntersecting
                        ? visible.add(entry.target.id)
                        : visible.delete(entry.target.id),
                );

                const first = targets.find((target) => visible.has(target.id));

                if (first) {
                    setActive(first.id);
                }
            },
            { rootMargin: '-96px 0px -60% 0px' },
        );

        targets.forEach((target) => observer.observe(target));

        return () => observer.disconnect();
    }, [key]);

    return active;
}
