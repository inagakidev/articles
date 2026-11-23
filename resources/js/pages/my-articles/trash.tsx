import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import { shortDate } from '@/lib/dates';
import { useTranslation } from '@/lib/i18n';
import { mine } from '@/routes/articles';
import * as trashRoutes from '@/routes/articles/trash';

type TrashedArticle = {
    id: number;
    title: string | null;
    deletedAt: string;
    restorableUntil: string;
};

/**
 * Lixeira (RF-116 a RF-119): o que foi excluído volta ao estado de antes
 * por sete dias; depois, sai de vez sozinho.
 */
export default function Trash({
    articles,
    trashDays,
}: {
    articles: TrashedArticle[];
    trashDays: number;
}) {
    const { t, locale } = useTranslation();

    const daysLeft = (iso: string) =>
        Math.max(
            0,
            Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000),
        );

    return (
        <>
            <Head title={t('trash.title')} />

            <div className="mx-auto flex w-full max-w-page flex-col gap-8 px-4 pt-10 pb-24 sm:px-8">
                <div className="flex flex-col gap-3">
                    <Link
                        href={mine()}
                        className="inline-flex w-fit items-center gap-1.5 rounded-full text-meta font-bold text-primary-text hover:underline"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        {t('trash.back')}
                    </Link>
                    <h1 className="font-display text-[clamp(2rem,4vw,2.5rem)] leading-tight font-extrabold tracking-[-0.02em]">
                        {t('trash.title')}
                    </h1>
                    <p className="text-text-secondary">
                        {t('my_articles.trash_note', { days: trashDays })}
                    </p>
                </div>

                {articles.length === 0 ? (
                    <EmptyState
                        Icon={Trash2}
                        title={t('trash.empty.title')}
                        text={t('trash.empty.text')}
                        className="rounded-card border border-border bg-surface"
                    />
                ) : (
                    <ul className="flex flex-col gap-3">
                        {articles.map((article) => {
                            const name =
                                article.title || t('my_articles.untitled');
                            const days = daysLeft(article.restorableUntil);

                            return (
                                <li
                                    key={article.id}
                                    className="flex flex-wrap items-center gap-4 rounded-inner border border-border bg-surface px-5 py-4.5"
                                >
                                    <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-1.5">
                                        <h2 className="font-display text-[1.1875rem] leading-[1.625rem] font-bold">
                                            {article.title || (
                                                <em>
                                                    {t('my_articles.untitled')}
                                                </em>
                                            )}
                                        </h2>
                                        <span className="text-meta text-text-secondary">
                                            {t('trash.meta', {
                                                date: shortDate(
                                                    article.deletedAt,
                                                    locale,
                                                ),
                                            })}{' '}
                                            ·{' '}
                                            {days <= 1
                                                ? t('trash.last_day')
                                                : t('trash.days_left', {
                                                      days,
                                                  })}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="md"
                                        aria-label={t('trash.restore_named', {
                                            title: name,
                                        })}
                                        onClick={() =>
                                            router.delete(
                                                trashRoutes.destroy(article.id)
                                                    .url,
                                                {
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                    >
                                        <RotateCcw aria-hidden="true" />
                                        {t('trash.restore')}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
}
