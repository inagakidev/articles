import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Bookmark,
    ListChecks,
    PenLine,
    Save,
    Search,
    ShieldCheck,
    Signpost,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import SectionHeading, {
    LandingContainer,
} from '@/components/blocks/section-heading';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import type { MascotArt } from '@/components/ui/mascot';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { register } from '@/routes';

type Journey = {
    id: 'ler' | 'escrever';
    tab: TranslationKey;
    TabIcon: LucideIcon;
    art: MascotArt;
    title: TranslationKey;
    points: { Icon: LucideIcon; title: TranslationKey; text: TranslationKey }[];
};

const journeys: Journey[] = [
    {
        id: 'ler',
        tab: 'landing.audience.readers',
        TabIcon: BookOpen,
        art: 'lendo',
        title: 'landing.audience.readers.title',
        points: [
            {
                Icon: ShieldCheck,
                title: 'landing.audience.readers.point1.title',
                text: 'landing.audience.readers.point1.text',
            },
            {
                Icon: Search,
                title: 'landing.audience.readers.point2.title',
                text: 'landing.audience.readers.point2.text',
            },
            {
                Icon: Bookmark,
                title: 'landing.audience.readers.point3.title',
                text: 'landing.audience.readers.point3.text',
            },
        ],
    },
    {
        id: 'escrever',
        tab: 'landing.audience.writers',
        TabIcon: PenLine,
        art: 'escrevendo',
        title: 'landing.audience.writers.title',
        points: [
            {
                Icon: Save,
                title: 'landing.audience.writers.point1.title',
                text: 'landing.audience.writers.point1.text',
            },
            {
                Icon: ListChecks,
                title: 'landing.audience.writers.point2.title',
                text: 'landing.audience.writers.point2.text',
            },
            {
                Icon: Signpost,
                title: 'landing.audience.writers.point3.title',
                text: 'landing.audience.writers.point3.text',
            },
        ],
    },
];

/**
 * As duas jornadas em abas (padrão de abas do WAI-ARIA: setas trocam a aba,
 * só a aba ativa entra na ordem do Tab). A chamada de quem lê volta quando
 * a listagem de artigos existir.
 */
export default function Audience() {
    const { t } = useTranslation();
    const [active, setActive] = useState(0);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const journey = journeys[active];

    function onKeyDown(event: KeyboardEvent) {
        const moves: Record<string, number> = {
            ArrowRight: active + 1,
            ArrowLeft: active - 1,
            Home: 0,
            End: journeys.length - 1,
        };

        if (!(event.key in moves)) {
            return;
        }

        event.preventDefault();
        const next = (moves[event.key] + journeys.length) % journeys.length;
        setActive(next);
        tabs.current[next]?.focus();
    }

    return (
        <section
            id="para-quem"
            aria-labelledby="para-quem-title"
            className="scroll-mt-17 py-[clamp(72px,10vw,128px)]"
        >
            <LandingContainer className="flex flex-col gap-9">
                <SectionHeading
                    id="para-quem-title"
                    eyebrow={t('landing.audience.eyebrow')}
                    title={t('landing.audience.title')}
                    lead={t('landing.audience.lead')}
                />

                <div
                    role="tablist"
                    aria-label={t('landing.audience.tabs')}
                    onKeyDown={onKeyDown}
                    className="relative flex w-[min(520px,100%)] self-center rounded-full bg-surface-muted p-1.5 ring-1 ring-pastel-lavender ring-inset dark:ring-border"
                >
                    <span
                        aria-hidden="true"
                        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-surface shadow-md transition-[left] duration-(--duration-slow) ease-emphasized"
                        style={{ left: active === 0 ? 6 : '50%' }}
                    />
                    {journeys.map(({ id, tab, TabIcon }, index) => (
                        <button
                            key={id}
                            ref={(element) => {
                                tabs.current[index] = element;
                            }}
                            type="button"
                            role="tab"
                            id={`tab-${id}`}
                            aria-controls={`painel-${id}`}
                            aria-selected={index === active}
                            tabIndex={index === active ? 0 : -1}
                            onClick={() => setActive(index)}
                            className="relative z-1 inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-body font-extrabold"
                        >
                            <TabIcon
                                aria-hidden="true"
                                className="size-[18px]"
                            />
                            {t(tab)}
                        </button>
                    ))}
                </div>

                <div
                    key={journey.id}
                    role="tabpanel"
                    id={`painel-${journey.id}`}
                    aria-labelledby={`tab-${journey.id}`}
                    className="flex flex-wrap items-center gap-[clamp(24px,5vw,56px)] rounded-[32px] border border-border bg-surface p-[clamp(24px,4vw,48px)]"
                >
                    <div className="flex flex-[1_1_220px] animate-rise justify-center">
                        <Mascot art={journey.art} size={200} float grounded />
                    </div>
                    <div className="stagger flex min-w-0 flex-[999_1_380px] flex-col gap-5.5">
                        <h3 className="text-[clamp(1.5rem,2.8vw,2rem)] leading-[1.2] font-extrabold tracking-[-0.02em]">
                            {t(journey.title)}
                        </h3>
                        <ul className="flex flex-col gap-4">
                            {journey.points.map(({ Icon, title, text }) => (
                                <li
                                    key={title}
                                    className="flex items-start gap-3.5"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-muted text-primary-text"
                                    >
                                        <Icon className="size-[18px]" />
                                    </span>
                                    <div className="flex flex-col gap-0.5">
                                        <strong className="text-[1.0625rem]">
                                            {t(title)}
                                        </strong>
                                        <span className="text-label leading-[1.4375rem] text-text-secondary">
                                            {t(text)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {journey.id === 'escrever' && (
                            <div>
                                <Button
                                    asChild
                                    size="xl"
                                    className="rounded-[14px] shadow-primary"
                                >
                                    <Link href={register()}>
                                        <PenLine
                                            aria-hidden="true"
                                            className="size-[18px]"
                                        />
                                        {t('landing.cta.write')}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </LandingContainer>
        </section>
    );
}
