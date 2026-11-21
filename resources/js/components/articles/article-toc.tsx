import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type TocItem = { id: string; text: string; level: number };

/** Sumário automático "Neste artigo" (RF-095), a partir dos títulos do texto. */
export default function ArticleToc({ items }: { items: TocItem[] }) {
    const { t } = useTranslation();

    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-labelledby="toc-title" className="flex flex-col gap-2">
            <h2
                id="toc-title"
                className="text-caption font-extrabold tracking-[0.08em] text-text-secondary uppercase"
            >
                {t('preview.toc')}
            </h2>
            <ol className="flex flex-col gap-1 border-l border-border">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className={cn(
                                '-ml-px block border-l-2 border-transparent py-1 text-meta text-text-secondary hover:border-primary hover:text-text-primary',
                                item.level === 3 ? 'pl-7' : 'pl-4',
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
