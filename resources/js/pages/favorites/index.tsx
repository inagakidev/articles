import { Head, Link, router } from '@inertiajs/react';
import { Bookmark, BookmarkMinus, BookmarkX, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ArticleCard from '@/components/articles/article-card';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import MascotStage from '@/components/ui/mascot-stage';
import Pagination from '@/components/ui/pagination';
import { useTranslation } from '@/lib/i18n';
import { index as articlesIndex } from '@/routes/articles';
import * as favoriteRoutes from '@/routes/favorites';
import type { ArticleSummary } from '@/types';

type Sort = 'salvos' | 'publicados';

type SavedArticle = {
    articleId: number;
    /** Quando foi salvo, para o "Desfazer" devolver ao mesmo lugar. */
    savedAt: string;
    /** Nulo quando o artigo saiu do ar: só o aviso aparece. */
    article: ArticleSummary | null;
};

type Props = {
    sort: Sort;
    favorites: {
        data: SavedArticle[];
        currentPage: number;
        lastPage: number;
        total: number;
    };
};

function pageUrl(sort: Sort, page = 1): string {
    const query: Record<string, string | number> = {};

    if (sort !== 'salvos') query.ordem = sort;
    if (page > 1) query.page = page;

    return favoriteRoutes.index({ query }).url;
}

const ripples = [210, 270, 330];

/**
 * Favoritos (pranchas "Favoritos" e "Favoritos vazio", RF-159 a RF-162):
 * os artigos salvos, só para quem salvou. Um artigo que saiu do ar fica
 * como indisponível até sair da lista; remover tem "Desfazer".
 */
export default function Favorites({ sort, favorites }: Props) {
    const { t } = useTranslation();

    function remove(saved: SavedArticle) {
        router.delete(favoriteRoutes.destroy(saved.articleId).url, {
            preserveScroll: true,
            onSuccess: () => {
                if (!saved.article) {
                    return;
                }

                toast.success(
                    t('favorites.removed', { title: saved.article.title }),
                    {
                        duration: 10000,
                        action: {
                            label: t('favorites.undo'),
                            onClick: () =>
                                router.post(
                                    favoriteRoutes.store(saved.articleId).url,
                                    { saved_at: saved.savedAt },
                                    { preserveScroll: true },
                                ),
                        },
                    },
                );
            },
        });
    }

    return (
        <>
            <Head title={t('favorites.title')} />

            <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-4 pt-10 pb-24 sm:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="font-display text-[1.75rem]/9 font-extrabold tracking-[-0.02em] sm:text-[2.25rem]/11">
                            {t('favorites.title')}
                        </h1>
                        <p className="mt-1.5 flex items-center gap-1.5 text-[0.9375rem] text-text-secondary">
                            <Eye aria-hidden="true" className="size-4" />
                            {t('favorites.private')}
                        </p>
                    </div>
                    {favorites.total > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="favoritos-ordem"
                                className="text-[0.8125rem] font-bold"
                            >
                                {t('favorites.sort.label')}
                            </label>
                            <select
                                id="favoritos-ordem"
                                value={sort}
                                onChange={(event) =>
                                    router.get(
                                        pageUrl(event.target.value as Sort),
                                        {},
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        },
                                    )
                                }
                                className="h-11 min-w-55 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem]"
                            >
                                <option value="salvos">
                                    {t('favorites.sort.saved')}
                                </option>
                                <option value="publicados">
                                    {t('favorites.sort.published')}
                                </option>
                            </select>
                        </div>
                    )}
                </div>

                {favorites.total === 0 ? (
                    <Empty />
                ) : (
                    <>
                        <h2 className="sr-only">{t('favorites.list')}</h2>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
                            {favorites.data.map((saved) =>
                                saved.article ? (
                                    <ArticleCard
                                        key={saved.articleId}
                                        article={saved.article}
                                        action={
                                            <button
                                                type="button"
                                                aria-pressed="true"
                                                aria-label={t(
                                                    'favorites.remove',
                                                    {
                                                        title: saved.article
                                                            .title,
                                                    },
                                                )}
                                                title={t(
                                                    'favorites.remove_short',
                                                )}
                                                onClick={() => remove(saved)}
                                                className="inline-flex size-10 items-center justify-center rounded-xl bg-surface text-primary shadow-sm transition-transform hover:scale-105"
                                            >
                                                <Bookmark
                                                    aria-hidden="true"
                                                    className="size-5 fill-current"
                                                />
                                            </button>
                                        }
                                    />
                                ) : (
                                    <Unavailable
                                        key={saved.articleId}
                                        onRemove={() => remove(saved)}
                                    />
                                ),
                            )}
                        </div>
                        <p
                            role="status"
                            className="text-center text-meta text-text-secondary"
                        >
                            {favorites.total === 1
                                ? t('favorites.status_one')
                                : t('favorites.status', {
                                      count: favorites.total,
                                  })}
                        </p>
                        <Pagination
                            current={favorites.currentPage}
                            last={favorites.lastPage}
                            href={(page) => pageUrl(sort, page)}
                        />
                    </>
                )}
            </div>
        </>
    );
}

/** O artigo saiu do ar: fica o aviso, sem nada do conteúdo. */
function Unavailable({ onRemove }: { onRemove: () => void }) {
    const { t } = useTranslation();

    return (
        <article className="flex min-h-95 flex-col justify-center gap-3 rounded-card border border-dashed border-border-strong bg-surface p-6">
            <span
                aria-hidden="true"
                className="inline-flex size-11 items-center justify-center rounded-inner bg-surface-muted text-text-secondary"
            >
                <BookmarkX className="size-5" />
            </span>
            <h3 className="font-display text-lg/6.5 font-bold">
                {t('favorites.unavailable.title')}
            </h3>
            <p className="text-[0.9375rem] leading-[1.45] text-text-secondary">
                {t('favorites.unavailable.text')}
            </p>
            <div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                >
                    <BookmarkMinus aria-hidden="true" />
                    {t('favorites.unavailable.remove')}
                </Button>
            </div>
        </article>
    );
}

/** Nada salvo ainda (prancha "Favoritos vazio"). */
function Empty() {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col items-center gap-3.5 px-2 py-8 text-center">
            <MascotStage ripples={ripples} className="p-6">
                <Mascot art="lendo" size={180} float className="relative" />
            </MascotStage>
            <strong className="font-display text-[1.375rem] font-extrabold">
                {t('favorites.empty.title')}
            </strong>
            <p className="max-w-md text-[0.9375rem] leading-[1.45] text-text-secondary">
                {t('favorites.empty.text')}
            </p>
            <Button asChild size="md">
                <Link href={articlesIndex().url}>
                    {t('favorites.empty.action')}
                </Link>
            </Button>
        </section>
    );
}
