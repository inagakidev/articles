import Marquee from '@/components/ui/marquee';
import Pill from '@/components/ui/pill';
import { useTranslation } from '@/lib/i18n';
import type { CategorySummary } from '@/types';

/**
 * Faixa com as categorias, logo abaixo da abertura. A lista em texto é a
 * versão para leitores de tela; a faixa é só visual.
 */
export default function CategoriesMarquee({
    categories,
}: {
    categories: CategorySummary[];
}) {
    const { t } = useTranslation();

    return (
        <div className="relative mt-[clamp(40px,6vw,72px)] border-y border-border bg-surface/60 py-5.5">
            <p className="sr-only">
                {t('landing.categories.label', {
                    list: categories.map(({ name }) => name).join(', '),
                })}
            </p>
            <div aria-hidden="true">
                <Marquee fast>
                    {categories.map(({ name, color }) => (
                        <Pill key={name} tone={color} size="md">
                            {name}
                        </Pill>
                    ))}
                </Marquee>
            </div>
        </div>
    );
}
