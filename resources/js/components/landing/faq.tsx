import { Plus } from 'lucide-react';
import { useState } from 'react';
import SectionHeading, {
    LandingContainer,
} from '@/components/landing/section-heading';
import Mascot from '@/components/ui/mascot';
import TextLink from '@/components/ui/text-link';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { content } from '@/routes/policies';

const questions = [1, 2, 3, 4, 5, 6, 7].map((number) => ({
    id: `faq-${number}`,
    question: `landing.faq.q${number}` as TranslationKey,
    answer: `landing.faq.a${number}` as TranslationKey,
}));

/** Perguntas frequentes, com a estimativa de revisão (RF-377, RF-380). */
export default function Faq() {
    const { t } = useTranslation();
    const [open, setOpen] = useState<string | null>(questions[0].id);

    return (
        <section
            id="faq"
            aria-labelledby="faq-title"
            className="scroll-mt-17 py-[clamp(72px,10vw,128px)]"
        >
            <LandingContainer className="flex flex-wrap items-start gap-[clamp(32px,6vw,72px)]">
                <div className="flex flex-[1_1_300px] flex-col gap-4.5">
                    <SectionHeading
                        id="faq-title"
                        align="start"
                        eyebrow={t('landing.faq.eyebrow')}
                        title={t('landing.faq.title')}
                        lead={
                            <>
                                {t('landing.faq.lead_before')}{' '}
                                <TextLink
                                    href={content()}
                                    className="font-bold"
                                >
                                    {t('policies.content')}
                                </TextLink>{' '}
                                {t('landing.faq.lead_after')}
                            </>
                        }
                    />
                    <div className="reveal">
                        <Mascot art="pensativo" size={170} float grounded />
                    </div>
                </div>

                <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-3">
                    {questions.map(({ id, question, answer }) => {
                        const expanded = open === id;

                        return (
                            <div
                                key={id}
                                className="overflow-hidden rounded-card border border-border bg-surface"
                            >
                                <h3>
                                    <button
                                        type="button"
                                        id={`${id}-button`}
                                        aria-expanded={expanded}
                                        aria-controls={`${id}-panel`}
                                        onClick={() =>
                                            setOpen(expanded ? null : id)
                                        }
                                        className="flex min-h-16 w-full items-center gap-4 px-5.5 py-4.5 text-left text-[1.125rem] leading-[1.35] font-bold"
                                    >
                                        <span className="flex-1">
                                            {t(question)}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-[transform,background-color] duration-(--duration-slow) ease-emphasized',
                                                expanded
                                                    ? 'rotate-45 bg-surface-selected'
                                                    : 'bg-surface-muted',
                                            )}
                                        >
                                            <Plus className="size-[18px]" />
                                        </span>
                                    </button>
                                </h3>
                                <div
                                    id={`${id}-panel`}
                                    role="region"
                                    aria-labelledby={`${id}-button`}
                                    inert={!expanded}
                                    className={cn(
                                        'grid transition-[grid-template-rows] duration-(--duration-slow) ease-emphasized',
                                        expanded
                                            ? 'grid-rows-[1fr]'
                                            : 'grid-rows-[0fr]',
                                    )}
                                >
                                    <div className="overflow-hidden">
                                        <p className="px-5.5 pb-5 text-body leading-[1.625rem] text-text-secondary">
                                            {t(answer)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </LandingContainer>
        </section>
    );
}
