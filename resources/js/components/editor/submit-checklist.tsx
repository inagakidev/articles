import { CircleCheck, CircleDashed, Info } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { content } from '@/routes/policies';

export type ChecklistItem = {
    key: TranslationKey;
    done: boolean;
    /** Leva ao que falta corrigir ("Corrigir" na prancha). */
    fix?: () => void;
};

/**
 * O que falta para enviar (RF-318): título, conteúdo, categoria, idioma e,
 * havendo imagens, o texto alternativo de todas (RF-087).
 */
export default function SubmitChecklist({ items }: { items: ChecklistItem[] }) {
    const { t } = useTranslation();
    const missing = items.filter((item) => !item.done).length;

    return (
        <section
            aria-labelledby="checklist-title"
            className="flex flex-col gap-3"
        >
            <div>
                <h2
                    id="checklist-title"
                    className="font-display text-label font-extrabold"
                >
                    {missing === 0
                        ? t('editor.checklist.ready')
                        : missing === 1
                          ? t('editor.checklist.missing_one')
                          : t('editor.checklist.missing', { count: missing })}
                </h2>
                <p className="text-caption text-text-secondary">
                    {t('editor.checklist.optional')}
                </p>
            </div>
            <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                    <li
                        key={item.key}
                        className={cn(
                            'flex items-center gap-2 text-meta',
                            item.done
                                ? 'text-text-primary'
                                : 'font-semibold text-text-secondary',
                        )}
                    >
                        {item.done ? (
                            <CircleCheck
                                aria-hidden="true"
                                className="size-4 text-success-fg"
                            />
                        ) : (
                            <CircleDashed
                                aria-hidden="true"
                                className="size-4"
                            />
                        )}
                        {t(item.key)}
                        <span className="sr-only">
                            {t(
                                item.done
                                    ? 'editor.checklist.done'
                                    : 'editor.checklist.pending',
                            )}
                        </span>
                        {!item.done && item.fix && (
                            <button
                                type="button"
                                onClick={item.fix}
                                className="ml-auto rounded-full text-caption font-bold text-primary-text hover:underline"
                            >
                                {t('editor.checklist.fix')}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            <a
                href={content().url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 self-start text-caption font-bold text-primary-text hover:underline"
            >
                <Info aria-hidden="true" className="size-3.5" />
                {t('editor.checklist.review_help')}
            </a>
        </section>
    );
}
