import { Head, Link } from '@inertiajs/react';
import ArticleView from '@/components/articles/article-view';
import Mascot from '@/components/ui/mascot';
import { formatShortDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { index as articles } from '@/routes/articles';
import type { ReadableArticle } from '@/types';

type Props = {
    article: ReadableArticle & {
        /** Primeira publicação (RF-137). */
        publishedAt: string;
        /** Quando uma versão nova foi aprovada depois; senão, nulo. */
        updatedAt: string | null;
    };
};

/**
 * Leitura pública (prancha "Leitura", RF-137): o artigo, quem escreveu e o
 * fim da leitura. Curtir, favoritar, compartilhar, denunciar e comentar
 * entram com as fatias deles (14, 17, 18 e 20).
 */
export default function Show({ article }: Props) {
    const { t, locale } = useTranslation();

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
                after={<ReadingEnd category={article.category} />}
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
