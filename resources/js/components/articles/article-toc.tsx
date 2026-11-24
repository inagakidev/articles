import { useEffect, useState } from 'react';
import { ListTree } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/types';

export type { TocItem };

/** Altura do cabeçalho fixo mais uma folga: o título "atual" é o que passou dela. */
const OFFSET = 120;

/**
 * Título em que a leitura está: o último que já passou do topo. Antes do
 * primeiro, nenhum.
 */
function useActiveHeading(items: TocItem[]): string | null {
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        if (items.length === 0) {
            return;
        }

        let frame = 0;

        function update() {
            frame = 0;
            let current: string | null = null;

            for (const item of items) {
                const heading = document.getElementById(item.id);

                if (heading && heading.getBoundingClientRect().top <= OFFSET) {
                    current = item.id;
                }
            }

            setActive(current);
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
    }, [items]);

    return active;
}

/**
 * Sumário automático "Neste artigo" (RF-095), a partir dos títulos do texto.
 * O título em leitura fica marcado, com `aria-current="location"`.
 */
export default function ArticleToc({
    items,
    onNavigate,
}: {
    items: TocItem[];
    /** Chamado ao escolher um título (o sumário do celular fecha). */
    onNavigate?: () => void;
}) {
    const { t } = useTranslation();
    const active = useActiveHeading(items);

    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-labelledby="toc-title" className="flex flex-col gap-2">
            <h2
                id="toc-title"
                className="flex items-center gap-2 text-caption font-bold tracking-[0.06em] text-text-secondary uppercase"
            >
                <ListTree aria-hidden="true" className="size-4" />
                {t('preview.toc')}
            </h2>
            <ol className="flex flex-col gap-0.5 border-l-2 border-border pl-3.5">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            onClick={onNavigate}
                            aria-current={
                                item.id === active ? 'location' : undefined
                            }
                            className={cn(
                                'block rounded-lg px-3 py-1.5 text-meta font-semibold text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                                'aria-[current=location]:bg-surface-selected aria-[current=location]:font-bold aria-[current=location]:text-text-on-selected',
                                item.level === 3 && 'ml-4',
                            )}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
