import { Head, Link, usePage } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import ArticleView from '@/components/articles/article-view';
import CommentSection from '@/components/interactions/comment-section';
import ActionTip from '@/components/interactions/action-tip';
import FavoriteButton from '@/components/interactions/favorite-button';
import type { CommentsData } from '@/components/interactions/comment-section';
import LikeButton from '@/components/interactions/like-button';
import ModerationMenu from '@/components/moderation/moderation-menu';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import ReportButton from '@/components/reports/report-button';
import ShareButton from '@/components/share/share-button';
import Mascot from '@/components/ui/mascot';
import { formatShortDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { index as articles } from '@/routes/articles';
import { store as likeArticle } from '@/routes/likes/article';
import type { ReadableArticle } from '@/types';

type Props = {
    article: ReadableArticle & {
        /** Primeira publicação (RF-137). */
        publishedAt: string;
        /** Quando uma versão nova foi aprovada depois; senão, nulo. */
        updatedAt: string | null;
    };
    /** Curtidas: a contagem é pública, quem curtiu não (RF-151, RF-152). */
    likes: {
        articleId: number;
        count: number;
        liked: boolean;
        canLike: boolean;
    };
    /** Favoritos: a contagem é pública, a lista não (RF-160, RF-161). */
    favorites: { count: number; favorited: boolean; canFavorite: boolean };
    comments: CommentsData;
    /** Denunciar o artigo (RF-164): quem pode e se já denunciou. */
    report: { canReport: boolean; reported: boolean };
    /** Só para a administradora: despublicar e excluir de vez (D87). */
    moderation?: { articleId: number; policyItems: PolicyItem[] } | null;
};

/**
 * Leitura pública (prancha "Leitura", RF-137): o artigo, quem escreveu,
 * curtir, favoritar, compartilhar, o fim da leitura e os comentários (D86,
 * D88, D89) e denunciar (D91).
 */
export default function Show({
    article,
    likes,
    favorites,
    comments,
    report,
    moderation,
}: Props) {
    const { t, locale } = useTranslation();
    const { auth } = usePage().props;

    return (
        <>
            <Head title={article.title ?? ''} />
            <ArticleView
                article={article}
                byline={
                    <>
                        {t('reading.published_on')}{' '}
                        <time dateTime={article.publishedAt}>
                            {formatShortDate(locale, article.publishedAt)}
                        </time>
                        {article.updatedAt && (
                            <>
                                {' · '}
                                {t('reading.updated_on')}{' '}
                                <time dateTime={article.updatedAt}>
                                    {formatShortDate(locale, article.updatedAt)}
                                </time>
                            </>
                        )}
                    </>
                }
                actions={
                    <>
                        <LikeButton
                            count={likes.count}
                            liked={likes.liked}
                            canLike={likes.canLike}
                            url={likeArticle(likes.articleId).url}
                            reload={['likes']}
                            label={t('likes.article')}
                            ownHint={
                                comments.canComment && !likes.canLike
                                    ? t('likes.own_article')
                                    : undefined
                            }
                            guest={!auth.user}
                        />
                        <ActionTip label={t('comments.title')}>
                            <a
                                href="#comentarios"
                                aria-label={t('comments.go_to', {
                                    count: comments.total,
                                })}
                                className="inline-flex size-10 flex-col items-center justify-center gap-0.5 rounded-full text-xs leading-3 font-bold text-text-secondary transition-colors outline-none hover:bg-surface-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-surface-selected"
                            >
                                <MessageCircle
                                    aria-hidden="true"
                                    className="size-5"
                                />
                                <span aria-hidden="true" className="leading-3">
                                    {comments.total}
                                </span>
                            </a>
                        </ActionTip>
                        <FavoriteButton
                            articleId={likes.articleId}
                            count={favorites.count}
                            favorited={favorites.favorited}
                            canFavorite={favorites.canFavorite}
                            guest={!auth.user}
                        />
                        <ShareButton
                            label={t('share.action')}
                            title={t('share.article_title')}
                            linkLabel={t('share.article_link')}
                            text={article.title ?? ''}
                            iconOnly
                        />
                        {(report.canReport || !auth.user) && (
                            <div className="relative flex size-10 items-center justify-center">
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-2 top-0 border-t border-border"
                                />
                                <ReportButton
                                    target="article"
                                    id={likes.articleId}
                                    subject={t('reports.subject.article', {
                                        title: article.title ?? '',
                                        author: article.author.username ?? '',
                                    })}
                                    canReport={report.canReport}
                                    guest={!auth.user}
                                    reported={report.reported}
                                    iconOnly
                                    className="relative"
                                />
                            </div>
                        )}
                        {moderation && (
                            <ModerationMenu
                                articleId={moderation.articleId}
                                policyItems={moderation.policyItems}
                            />
                        )}
                    </>
                }
                after={
                    <>
                        <ReadingEnd category={article.category} />
                        <CommentSection
                            articleId={likes.articleId}
                            data={comments}
                            policyItems={moderation?.policyItems ?? null}
                        />
                    </>
                }
            />
        </>
    );
}

const ripples = [130, 170];

/** "Você chegou ao fim": o mascote lendo, pequeno, só depois do texto (DESIGN §5.3). */
function ReadingEnd({ category }: { category: ReadableArticle['category'] }) {
    const { t } = useTranslation();

    return (
        <div className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-section bg-surface-muted px-7 py-6">
            <div className="relative flex items-center justify-center p-6">
                {ripples.map((size, index) => (
                    <span
                        key={size}
                        aria-hidden="true"
                        className="ripple"
                        style={{
                            width: size,
                            height: size,
                            animationDelay: `${index * 0.7}s`,
                        }}
                    />
                ))}
                <Mascot art="lendo" size={112} float className="relative" />
            </div>
            <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1.5">
                <strong className="font-display text-h3 font-extrabold">
                    {t('reading.end.title')}
                </strong>
                <span className="text-label leading-6 text-text-secondary">
                    {t('reading.end.share')}
                </span>
                <Link
                    href={articles({
                        query: category ? { categoria: category.slug } : {},
                    })}
                    className="text-meta font-bold text-primary-text hover:underline"
                >
                    {category
                        ? t('reading.end.more_in', { category: category.name })
                        : t('reading.end.more')}
                </Link>
            </div>
        </div>
    );
}
