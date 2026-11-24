import { Link } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    CircleCheck,
    CloudCheck,
    PenLine,
    Sparkles,
} from 'lucide-react';
import CategoriesMarquee from '@/components/blocks/categories-marquee';
import { LandingContainer } from '@/components/blocks/section-heading';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import MascotOrbit from '@/components/ui/mascot-orbit';
import StatusBadge from '@/components/ui/status-badge';
import { useWriteHref } from '@/hooks/use-write-href';
import { useTranslation } from '@/lib/i18n';
import { index as articles } from '@/routes/articles';
import type { TranslationKey } from '@/lib/i18n';
import type { CategorySummary } from '@/types';

const perks: TranslationKey[] = [
    'landing.hero.perk1',
    'landing.hero.perk2',
    'landing.hero.perk3',
];

/**
 * Abertura: o que é a plataforma, a chamada para escrever e o mascote em
 * órbita. O título animado tem uma versão completa só para leitores de tela.
 * A faixa de categorias só aparece quando houver categorias.
 */
export default function Hero({
    categories,
}: {
    categories: CategorySummary[];
}) {
    const { t } = useTranslation();
    const writeHref = useWriteHref();

    return (
        <section
            aria-labelledby="hero-title"
            className="relative overflow-hidden pt-[clamp(40px,7vw,88px)]"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden"
            >
                <span className="aurora top-[-10%] right-[5%] size-[min(520px,80vw)] bg-pastel-lavender" />
                <span className="aurora bottom-[-20%] left-[-10%] size-[min(420px,70vw)] bg-pastel-pink [animation-delay:-6s]" />
                <span className="aurora top-[30%] right-[30%] size-[min(300px,50vw)] bg-pastel-blue [animation-delay:-12s]" />
            </div>
            <div aria-hidden="true" className="dot-grid absolute inset-0" />
            <LandingContainer className="relative flex flex-wrap items-center gap-[clamp(32px,5vw,56px)]">
                <div className="stagger flex min-w-0 flex-[999_1_520px] flex-col gap-6">
                    <a
                        href="#como"
                        className="inline-flex h-9.5 items-center gap-2.5 self-start rounded-full bg-surface-muted pr-4 pl-2.5 ring-1 ring-pastel-lavender ring-inset dark:ring-border"
                    >
                        <Sparkles
                            aria-hidden="true"
                            className="size-[18px] text-primary-text"
                        />
                        <span className="shiny-text text-meta font-extrabold">
                            {t('landing.hero.badge')}
                        </span>
                        <ChevronRight
                            aria-hidden="true"
                            className="size-[15px] text-primary-text"
                        />
                    </a>

                    <h1
                        id="hero-title"
                        className="text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.06] font-extrabold tracking-[-0.035em]"
                    >
                        <span className="sr-only">
                            {t('landing.hero.title')}
                        </span>
                        <span aria-hidden="true">
                            {t('landing.hero.write')}{' '}
                            <span className="flip-words">
                                <span>{t('landing.hero.word1')}</span>
                                <span>{t('landing.hero.word2')}</span>
                                <span>{t('landing.hero.word3')}</span>
                            </span>
                            <br />
                            {t('landing.hero.line2_before')}{' '}
                            <span className="highlight-mark">
                                {t('landing.hero.line2_mark')}
                            </span>
                            {t('landing.hero.line2_after')}
                        </span>
                    </h1>

                    <p className="max-w-140 text-[clamp(1.0625rem,1.6vw,1.25rem)] leading-[1.6] text-text-secondary">
                        {t('landing.hero.lead')}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            asChild
                            size="xl"
                            className="shimmer shadow-primary"
                        >
                            <Link href={writeHref}>
                                <PenLine
                                    aria-hidden="true"
                                    className="size-[18px]"
                                />
                                {t('landing.cta.write')}
                            </Link>
                        </Button>
                        <Button asChild size="xl" variant="outline">
                            <Link href={articles()}>
                                <BookOpen
                                    aria-hidden="true"
                                    className="size-[18px]"
                                />
                                {t('landing.cta.read')}
                            </Link>
                        </Button>
                    </div>

                    <ul className="flex flex-wrap gap-x-5.5 gap-y-2">
                        {perks.map((perk) => (
                            <li
                                key={perk}
                                className="inline-flex items-center gap-1.5 text-label font-semibold text-text-secondary"
                            >
                                <CircleCheck
                                    aria-hidden="true"
                                    className="size-[17px] text-success-fg"
                                />
                                {t(perk)}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-[1_1_360px] animate-rise justify-center [animation-delay:200ms]">
                    <div className="relative flex w-[min(460px,92vw)] justify-center">
                        <MascotOrbit size="lg" float={false}>
                            <Mascot
                                art="apresentando"
                                size={230}
                                float
                                grounded
                                className="max-w-[42vw]"
                            />
                        </MascotOrbit>
                        <div
                            aria-hidden="true"
                            className="absolute bottom-[14%] left-0 flex animate-rise items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-meta font-bold shadow-lg [animation-delay:450ms]"
                        >
                            <CloudCheck
                                aria-hidden="true"
                                className="size-4 text-success-fg"
                            />
                            {t('landing.hero.saved')}
                        </div>
                        <div
                            aria-hidden="true"
                            className="absolute top-[12%] right-0 animate-rise rounded-full shadow-lg [animation-delay:600ms]"
                        >
                            <StatusBadge status="published" />
                        </div>
                    </div>
                </div>
            </LandingContainer>
            {categories.length > 0 ? (
                <CategoriesMarquee categories={categories} />
            ) : (
                <div className="h-[clamp(40px,6vw,72px)]" />
            )}
        </section>
    );
}
