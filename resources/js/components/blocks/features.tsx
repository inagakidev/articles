import {
    Accessibility,
    Bold,
    BookOpen,
    Eye,
    Heading2,
    Image,
    Italic,
    Languages,
    Link2,
    List,
    Moon,
    SquareCode,
    UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import SectionHeading, {
    LandingContainer,
} from '@/components/blocks/section-heading';
import Mascot from '@/components/ui/mascot';
import StatusBadge from '@/components/ui/status-badge';
import { localeNames, useTranslation } from '@/lib/i18n';
import { followPointer } from '@/lib/spotlight';
import { cn } from '@/lib/utils';

const toolbar = [Bold, Italic, Heading2, Link2, SquareCode, List, Image];

/** Grade de recursos: um cartão grande com a prévia do editor e cinco menores. */
export default function Features() {
    const { t } = useTranslation();

    return (
        <section
            id="recursos"
            aria-labelledby="recursos-title"
            className="scroll-mt-17 bg-linear-to-b from-bg via-surface-muted to-bg py-[clamp(72px,10vw,128px)]"
        >
            <LandingContainer className="flex flex-col gap-[clamp(40px,6vw,56px)]">
                <SectionHeading
                    id="recursos-title"
                    eyebrow={t('landing.features.eyebrow')}
                    title={t('landing.features.title')}
                    lead={t('landing.features.lead')}
                />
                <div className="grid grid-flow-dense grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
                    <FeatureCard
                        Icon={Eye}
                        title={t('landing.features.preview.title')}
                        text={t('landing.features.preview.text')}
                        className="md:col-span-2"
                    >
                        <div
                            aria-hidden="true"
                            className="border-beam mt-auto flex flex-col gap-3 rounded-inner border border-border bg-bg p-4"
                        >
                            <div className="flex flex-wrap items-center gap-1">
                                {toolbar.map((Tool, index) => (
                                    <span
                                        key={index}
                                        className={cn(
                                            'inline-flex size-8 items-center justify-center rounded-full',
                                            index === 0 &&
                                                'bg-surface-selected',
                                        )}
                                    >
                                        <Tool className="size-4" />
                                    </span>
                                ))}
                                <StatusBadge
                                    status="draft"
                                    size="sm"
                                    className="ml-auto"
                                />
                            </div>
                            <div className="font-display text-[1.375rem] leading-[1.25] font-extrabold">
                                {t('landing.features.preview.sample_title')}
                            </div>
                            <div className="text-label leading-[1.5625rem]">
                                {t('landing.features.preview.sample_before')}{' '}
                                <mark className="rounded-xs bg-pastel-yellow px-1 text-pastel-yellow-fg">
                                    {t('landing.features.preview.sample_mark')}
                                </mark>{' '}
                                {t('landing.features.preview.sample_after')}
                                <span className="caret" />
                            </div>
                            <div className="dark overflow-x-auto rounded-full bg-bg px-3.5 py-3 font-mono text-caption whitespace-pre text-text-primary">
                                <span className="text-primary-text">
                                    php
                                </span>{' '}
                                artisan queue:work --tries=3
                            </div>
                        </div>
                    </FeatureCard>

                    <FeatureCard
                        Icon={BookOpen}
                        title={t('landing.features.reading.title')}
                        text={t('landing.features.reading.text')}
                    >
                        <div
                            aria-hidden="true"
                            className="skeleton-sweep mt-auto flex flex-col gap-2"
                        >
                            {['92%', '100%', '84%', '96%', '60%'].map(
                                (width) => (
                                    <span
                                        key={width}
                                        className="h-2 rounded-xs bg-border"
                                        style={{ width }}
                                    />
                                ),
                            )}
                        </div>
                    </FeatureCard>

                    <FeatureCard
                        Icon={UserCheck}
                        iconClassName="bg-pastel-mint text-pastel-mint-fg"
                        title={t('landing.features.review.title')}
                        text={t('landing.features.review.text')}
                    >
                        <div
                            aria-hidden="true"
                            className="mt-auto flex items-end gap-2.5"
                        >
                            <Mascot art="rosto" size={44} />
                            <div className="relative flex flex-1 flex-col gap-1 rounded-inner rounded-bl-sm bg-surface-muted p-3.5">
                                <span className="text-badge font-bold text-text-secondary">
                                    {t('landing.features.review.label')}
                                </span>
                                <span className="text-meta leading-[1.3125rem]">
                                    {t('landing.features.review.quote')}
                                </span>
                                <span className="text-caption font-bold text-primary-text">
                                    {t('landing.features.review.next')}
                                </span>
                            </div>
                        </div>
                    </FeatureCard>

                    <FeatureCard
                        Icon={Accessibility}
                        iconClassName="bg-pastel-blue text-pastel-blue-fg"
                        title={t('landing.features.a11y.title')}
                        text={t('landing.features.a11y.text')}
                    >
                        <div
                            aria-hidden="true"
                            className="mt-auto flex flex-wrap gap-2"
                        >
                            <ContrastSample className="bg-brand-paper text-brand-ink ring-1 ring-border ring-inset">
                                Aa · 14,7:1
                            </ContrastSample>
                            <ContrastSample className="bg-brand-lavender text-brand-paper">
                                Aa · 4,75:1
                            </ContrastSample>
                            <ContrastSample className="bg-brand-ink text-brand-lilac">
                                Aa · 7,48:1
                            </ContrastSample>
                        </div>
                    </FeatureCard>

                    <FeatureCard
                        Icon={Languages}
                        iconClassName="bg-pastel-yellow text-pastel-yellow-fg"
                        title={t('landing.features.languages.title')}
                        text={t('landing.features.languages.text')}
                    >
                        <div
                            role="img"
                            aria-label={t('landing.features.languages.label')}
                            className="lang-swap mt-auto grid grid-cols-2 self-start rounded-full bg-surface-muted p-1"
                        >
                            <span className="inline-flex h-9 items-center justify-center px-4 text-meta font-bold">
                                {localeNames.pt_BR.name}
                            </span>
                            <span className="inline-flex h-9 items-center justify-center px-4 text-meta font-bold">
                                {localeNames.en.name}
                            </span>
                        </div>
                    </FeatureCard>

                    {/* Sempre escuro: mostra o tema escuro mesmo no claro */}
                    <FeatureCard
                        Icon={Moon}
                        iconClassName="bg-surface-selected text-primary-text"
                        title={t('landing.features.dark.title')}
                        text={t('landing.features.dark.text')}
                        className="dark bg-bg md:col-span-full"
                    >
                        <div
                            aria-hidden="true"
                            className="swatch-wave mt-auto flex gap-2"
                        >
                            {[
                                'bg-surface',
                                'bg-surface-selected',
                                'bg-primary',
                                'bg-pastel-mint',
                                'bg-pastel-pink',
                            ].map((color) => (
                                <span
                                    key={color}
                                    className={cn(
                                        'h-8.5 flex-1 rounded-full md:h-12',
                                        color,
                                    )}
                                />
                            ))}
                        </div>
                    </FeatureCard>
                </div>
            </LandingContainer>
        </section>
    );
}

function FeatureCard({
    Icon,
    iconClassName = 'bg-surface-muted text-primary-text',
    title,
    text,
    className,
    children,
}: {
    Icon: LucideIcon;
    iconClassName?: string;
    title: string;
    text: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <article
            onPointerMove={followPointer}
            className={cn(
                'lift-card spotlight reveal relative flex min-w-0 flex-col gap-3.5 overflow-hidden rounded-card border border-border bg-surface p-7 text-text-primary',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'card-icon inline-flex size-11 items-center justify-center rounded-full',
                    iconClassName,
                )}
            >
                <Icon className="size-[22px]" />
            </span>
            <h3 className="text-[1.375rem] leading-[1.25] font-extrabold">
                {title}
            </h3>
            <p className="text-body leading-[1.5625rem] text-text-secondary">
                {text}
            </p>
            {children}
        </article>
    );
}

/** Amostras de contraste com as cores reais dos temas, iguais nos dois. */
function ContrastSample({
    className,
    children,
}: {
    className: string;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                'inline-flex h-8.5 items-center rounded-full px-3 text-caption font-bold',
                className,
            )}
        >
            {children}
        </span>
    );
}
