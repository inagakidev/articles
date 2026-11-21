import { Check } from 'lucide-react';
import SectionHeading, {
    LandingContainer,
} from '@/components/blocks/section-heading';
import Mascot from '@/components/ui/mascot';
import type { MascotArt } from '@/components/ui/mascot';
import StatusBadge from '@/components/ui/status-badge';
import type { ArticleStatus } from '@/components/ui/status-badge';
import { useTranslation } from '@/lib/i18n';
import { followPointer } from '@/lib/spotlight';
import type { TranslationKey } from '@/lib/i18n';

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

/** Os três estados de um artigo, numa linha do tempo que se preenche ao rolar. */
export default function HowItWorks() {
    const { t } = useTranslation();

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
                <div className="relative mx-auto w-full max-w-230">
                    <span
                        aria-hidden="true"
                        className="absolute top-7 bottom-7 left-[27px] w-0.5 rounded-xs bg-border"
                    />
                    <span
                        aria-hidden="true"
                        className="timeline-fill absolute top-7 bottom-7 left-[27px] w-0.5 rounded-xs bg-linear-to-b from-primary to-pastel-lavender"
                    />
                    <ol className="flex flex-col gap-7">
                        {steps.map((step, index) => (
                            <li
                                key={step.status}
                                className="reveal relative grid grid-cols-[56px_minmax(0,1fr)] gap-[clamp(16px,3vw,32px)]"
                            >
                                <span
                                    aria-hidden="true"
                                    className="step-number relative z-1 inline-flex size-14 items-center justify-center rounded-[18px] bg-primary font-display text-[1.375rem] font-extrabold text-text-on-primary shadow-primary"
                                >
                                    {index + 1}
                                </span>
                                <div
                                    onPointerMove={followPointer}
                                    className="lift-card spotlight relative flex flex-wrap items-center gap-6 rounded-[28px] border border-border bg-surface p-[clamp(20px,3vw,32px)]"
                                >
                                    <div className="flex min-w-0 flex-[999_1_300px] flex-col gap-3">
                                        <StatusBadge status={step.status} />
                                        <h3 className="text-[clamp(1.375rem,2.4vw,1.75rem)] leading-[1.2] font-extrabold tracking-[-0.02em]">
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
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </LandingContainer>
        </section>
    );
}
