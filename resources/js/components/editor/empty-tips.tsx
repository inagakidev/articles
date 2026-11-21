import { Code, Heading2, Pilcrow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Mascot from '@/components/ui/mascot';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

const tips: [LucideIcon, TranslationKey, TranslationKey][] = [
    [Heading2, 'editor.tips.title_tip', 'editor.tips.title_example'],
    [Pilcrow, 'editor.tips.context', 'editor.tips.context_example'],
    [Code, 'editor.tips.code', 'editor.tips.code_example'],
];

/** Dicas do editor vazio (prancha "Editor vazio"); somem quando a pessoa escreve. */
export default function EmptyTips() {
    const { t } = useTranslation();

    return (
        <aside
            aria-labelledby="tips-title"
            className="mt-6 flex flex-wrap items-center gap-6 rounded-card border border-dashed border-pastel-lavender bg-surface-muted p-6 dark:border-border"
        >
            <Mascot art="escrevendo" size={120} float grounded />
            <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
                <h2
                    id="tips-title"
                    className="font-display text-h3 font-extrabold"
                >
                    {t('editor.tips.title')}
                </h2>
                <ul className="flex flex-col gap-2.5">
                    {tips.map(([Icon, title, example]) => (
                        <li key={title} className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-primary-text"
                            >
                                <Icon className="size-4" />
                            </span>
                            <span className="flex flex-col">
                                <strong className="text-meta">
                                    {t(title)}
                                </strong>
                                <span className="text-caption text-text-secondary">
                                    {t(example)}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
                <p className="text-caption text-text-secondary">
                    {t('editor.tips.footer')}
                </p>
            </div>
        </aside>
    );
}
