import { Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import SectionHeading, {
    LandingContainer,
} from '@/components/blocks/section-heading';
import Mascot from '@/components/ui/mascot';
import type { MascotArt } from '@/components/ui/mascot';
import StatusBadge from '@/components/ui/status-badge';
import type { ArticleStatus } from '@/components/ui/status-badge';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { followPointer } from '@/lib/spotlight';

type Step = {
    status: ArticleStatus;
    art: MascotArt;
    title: TranslationKey;
    text: TranslationKey;
    points: TranslationKey[];
};

const steps: Step[] = [
    {
        status: 'draft',
        art: 'escrevendo',
        title: 'landing.how.step1.title',
        text: 'landing.how.step1.text',
        points: ['landing.how.step1.point1', 'landing.how.step1.point2'],
    },
    {
        status: 'review',
        art: 'esperando',
        title: 'landing.how.step2.title',
        text: 'landing.how.step2.text',
        points: ['landing.how.step2.point1', 'landing.how.step2.point2'],
    },
    {
        status: 'published',
        art: 'comemorando',
        title: 'landing.how.step3.title',
        text: 'landing.how.step3.text',
        points: ['landing.how.step3.point1', 'landing.how.step3.point2'],
    },
];

/** Quanto o card de baixo escurece quando o próximo o cobre por inteiro. */
const MAX_DIM = 0.45;

/**
 * Escurece cada card conforme o próximo sobe por cima dele: a parte coberta
 * vira a variável `--covered` (0 a 1), que a camada escura e a escala usam.
 */
function useCoveredCards() {
    const cards = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        let frame = 0;

        function update() {
            frame = 0;
            const items = cards.current;

            items.forEach((card, index) => {
                const next = items[index + 1];

                if (!card) {
                    return;
                }

                if (!next) {
                    card.style.setProperty('--covered', '0');

                    return;
                }

                const own = card.getBoundingClientRect();
                const over = next.getBoundingClientRect();
                const covered = Math.min(
                    1,
                    Math.max(0, (own.bottom - over.top) / own.height),
                );
                card.style.setProperty('--covered', covered.toFixed(3));
            });
        }

        function schedule() {
            if (frame === 0) {
                frame = requestAnimationFrame(update);
            }
        }

        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, []);

    return cards;
}

/**
 * Os três estados de um artigo em cards que se empilham com a rolagem: cada
 * um entra com um "pop", fica preso no topo, e o próximo sobe por cima dele,
 * um pouco mais abaixo, deixando a borda dos anteriores à mostra. O de baixo
 * escurece e encolhe um pouco à medida que é coberto.
 */
export default function HowItWorks() {
    const { t } = useTranslation();
    const cards = useCoveredCards();

    return (
        <section
            id="como"
            aria-labelledby="como-title"
            className="scroll-mt-17 py-[clamp(72px,10vw,128px)]"
        >
            <LandingContainer className="flex flex-col gap-[clamp(40px,6vw,64px)]">
                <SectionHeading
                    id="como-title"
                    eyebrow={t('landing.how.eyebrow')}
                    title={t('landing.how.title')}
                    lead={t('landing.how.lead')}
                />
                <ol className="mx-auto flex w-full max-w-230 flex-col gap-[clamp(48px,10vh,96px)] pb-6">
                    {steps.map((step, index) => (
                        <li
                            key={step.status}
                            className="stack-card"
                            style={{ '--stack-index': index } as CSSProperties}
                        >
                            <div
                                ref={(element) => {
                                    cards.current[index] = element;
                                }}
                                onPointerMove={followPointer}
                                className="stack-pop stack-covered spotlight relative flex flex-wrap items-center gap-6 rounded-card border border-border bg-surface p-[clamp(20px,3vw,32px)] shadow-lg"
                            >
                                <div className="flex min-w-0 flex-[999_1_300px] flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            aria-hidden="true"
                                            className="inline-flex size-10 items-center justify-center rounded-full bg-primary font-display text-[1.125rem] font-extrabold text-text-on-primary shadow-primary"
                                        >
                                            {index + 1}
                                        </span>
                                        <StatusBadge status={step.status} />
                                    </div>
                                    <h3 className="text-[clamp(1.375rem,2.4vw,1.75rem)] leading-[1.2] font-extrabold tracking-[-0.02em]">
                                        <span className="sr-only">
                                            {t('landing.how.step_number', {
                                                number: index + 1,
                                            })}
                                        </span>
                                        {t(step.title)}
                                    </h3>
                                    <p className="text-[1.0625rem]/[1.6875rem] text-text-secondary">
                                        {t(step.text)}
                                    </p>
                                    <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
                                        {step.points.map((point) => (
                                            <li
                                                key={point}
                                                className="flex items-center gap-2 text-label font-semibold"
                                            >
                                                <Check
                                                    aria-hidden="true"
                                                    className="size-4 text-primary-text"
                                                />
                                                {t(point)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-[1_1_160px] justify-center">
                                    <Mascot
                                        art={step.art}
                                        size={150}
                                        float
                                        grounded
                                    />
                                </div>
                                <span
                                    aria-hidden="true"
                                    className="bg-black pointer-events-none absolute inset-0 rounded-[inherit]"
                                    style={{
                                        opacity: `calc(var(--covered, 0) * ${MAX_DIM})`,
                                    }}
                                />
                            </div>
                        </li>
                    ))}
                </ol>
            </LandingContainer>
        </section>
    );
}
