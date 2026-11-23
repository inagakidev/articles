import { Link } from '@inertiajs/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import { useTranslation } from '@/lib/i18n';
import { edit } from '@/routes/articles';

/**
 * "Enviado para revisão" (estado `form.submitSuccess`): a estimativa de
 * revisão (RF-377) e as saídas — seguir editando ou retirar da fila.
 */
export default function SubmittedBanner({
    articleId,
    title,
    hours,
    onWithdraw,
    onClose,
}: {
    articleId: number;
    title: string | null;
    hours: number;
    onWithdraw: () => void;
    onClose: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div
            role="status"
            className="relative flex flex-col items-start gap-5 rounded-card bg-pastel-lavender px-6 py-5 text-pastel-lavender-fg sm:flex-row sm:items-center sm:gap-7 sm:px-8"
        >
            <Mascot
                art="esperando"
                size={120}
                float
                grounded
                className="shrink-0"
            />
            <div className="flex flex-1 flex-col gap-2 pr-8">
                <span className="text-meta font-bold">
                    {t('my_articles.submitted.eyebrow')}
                </span>
                <strong className="font-display text-[1.5rem] leading-8 font-extrabold">
                    {title
                        ? t('my_articles.submitted.title_named', { title })
                        : t('my_articles.submitted.title')}
                </strong>
                <span className="text-body">
                    {t('my_articles.submitted.text', { hours })}
                </span>
                <div className="mt-1 flex flex-wrap gap-2.5">
                    <Button asChild size="md">
                        <Link href={edit(articleId)}>
                            {t('my_articles.submitted.keep_editing')}
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="md"
                        onClick={onWithdraw}
                    >
                        {t('my_articles.withdraw.action')}
                    </Button>
                </div>
            </div>
            <button
                type="button"
                onClick={onClose}
                aria-label={t('my_articles.close_notice')}
                className="absolute top-3.5 right-3.5 inline-flex size-10 items-center justify-center rounded-full hover:bg-surface/40"
            >
                <X aria-hidden="true" className="size-5" />
            </button>
        </div>
    );
}
