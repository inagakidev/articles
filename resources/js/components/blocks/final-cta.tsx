import { Link } from '@inertiajs/react';
import { PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import { useTranslation } from '@/lib/i18n';
import { register } from '@/routes';

const ripples = [260, 360, 460, 560];

/**
 * Chamada final num cartão sempre escuro (a classe "dark" aplica os tokens
 * do tema escuro só aqui), com ondas atrás do mascote.
 */
export default function FinalCta() {
    const { t } = useTranslation();

    return (
        <section
            aria-labelledby="cta-title"
            className="px-[clamp(16px,4vw,32px)] pb-[clamp(72px,10vw,120px)]"
        >
            <div className="dark reveal relative mx-auto flex max-w-300 flex-wrap items-center gap-10 overflow-hidden rounded-[40px] border border-border bg-bg p-[clamp(40px,6vw,72px)] text-text-primary">
                <div
                    aria-hidden="true"
                    className="dot-grid absolute inset-0 [mask-image:none] opacity-80"
                />
                <div className="relative flex flex-[999_1_420px] flex-col gap-5">
                    <span className="text-caption font-extrabold tracking-[0.1em] text-primary-text uppercase">
                        {t('landing.final.eyebrow')}
                    </span>
                    <h2
                        id="cta-title"
                        className="text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.1] font-extrabold tracking-[-0.03em]"
                    >
                        {t('landing.final.title')}
                    </h2>
                    <p className="max-w-130 text-[1.125rem]/7 text-text-secondary">
                        {t('landing.final.text')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="xl" className="rounded-[14px]">
                            <Link href={register()}>
                                <PenLine
                                    aria-hidden="true"
                                    className="size-[18px]"
                                />
                                {t('landing.final.cta')}
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="relative flex min-h-80 flex-[1_1_280px] items-center justify-center">
                    {ripples.map((size, index) => (
                        <span
                            key={size}
                            aria-hidden="true"
                            className="ripple"
                            style={{
                                width: size,
                                height: size,
                                animationDelay: `${index * 0.6}s`,
                            }}
                        />
                    ))}
                    <Mascot
                        art="comemorando"
                        size={220}
                        className="relative animate-float"
                    />
                </div>
            </div>
        </section>
    );
}
