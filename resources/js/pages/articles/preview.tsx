import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Eye, Send } from 'lucide-react';
import ArticleView from '@/components/articles/article-view';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { edit } from '@/routes/articles';
import * as submission from '@/routes/articles/submission';
import type { ReadableArticle } from '@/types';

type Props = {
    articleId: number;
    /** O que está na tela é o rascunho, e nada espera na fila (RF-102). */
    canSubmit: boolean;
    article: ReadableArticle;
};

/**
 * Prévia (prancha "Prévia", RF-072): a mesma renderização e o mesmo
 * componente da página pública (p4-06). Daqui também se envia (RF-323).
 */
export default function Preview({ articleId, canSubmit, article }: Props) {
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);

    function submit() {
        setSubmitting(true);
        router.post(
            submission.store(articleId).url,
            {},
            {
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ?? t('editor.submit.failed'),
                    ),
                onFinish: () => setSubmitting(false),
            },
        );
    }

    return (
        <>
            <Head
                title={`${t('preview.title')}: ${article.title || t('preview.untitled')}`}
            />

            <div className="sticky top-0 z-30 border-b border-pastel-lavender bg-surface-muted/95 backdrop-blur-md dark:border-border">
                <div className="mx-auto flex max-w-page flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
                    <span className="inline-flex items-center gap-2 font-display font-extrabold">
                        <Eye
                            aria-hidden="true"
                            className="size-5 text-primary-text"
                        />
                        {t('preview.title')}
                    </span>
                    <span className="text-meta text-text-secondary">
                        {t('preview.banner')}
                    </span>
                    <div className="ml-auto flex flex-wrap gap-2">
                        <Button
                            asChild
                            size="sm"
                            variant={canSubmit ? 'outline' : 'default'}
                        >
                            <Link href={edit(articleId)}>
                                <ArrowLeft aria-hidden="true" />
                                {t('preview.back')}
                            </Link>
                        </Button>
                        {canSubmit && (
                            <Button
                                type="button"
                                size="sm"
                                disabled={submitting}
                                onClick={submit}
                            >
                                <Send aria-hidden="true" />
                                {submitting
                                    ? t('editor.submit.sending')
                                    : t('editor.submit.action')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <ArticleView
                article={article}
                byline={t('preview.not_published')}
            />
        </>
    );
}
