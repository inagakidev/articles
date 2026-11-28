import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SignInPrompt from '@/components/interactions/sign-in-prompt';
import ReportDialog from '@/components/reports/report-dialog';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import Mascot from '@/components/ui/mascot';
import Pagination from '@/components/ui/pagination';
import { useTranslation } from '@/lib/i18n';
import CommentForm from '@/components/interactions/comments/comment-form';
import CommentItem from '@/components/interactions/comments/comment-item';
import DeleteDialog from '@/components/interactions/comments/delete-dialog';
import ModerateDialog from '@/components/interactions/comments/moderate-dialog';
import { RELOAD, flatten } from '@/components/interactions/comments/shared';
import type {
    CommentNode,
    CommentsData,
} from '@/components/interactions/comments/shared';

export type {
    CommentNode,
    CommentsData,
} from '@/components/interactions/comments/shared';

/** Quanto tempo o comentário recém-publicado fica destacado. */
const FRESH_MS = 2400;

/**
 * Comentários da leitura (prancha "Comentários · logada", RF-138 a RF-147):
 * qualquer pessoa lê; quem tem conta confirmada escreve, responde até 3
 * níveis, curte, edita e apaga. Quem visita é convidada a entrar (D94);
 * quem tem conta sem confirmar só lê. As partes ficam em `comments/`.
 */
export default function CommentSection({
    articleId,
    data,
    policyItems,
}: {
    articleId: number;
    data: CommentsData;
    /** Itens da Política, para a administradora apagar como moderação. */
    policyItems: PolicyItem[] | null;
}) {
    const { t } = useTranslation();
    const [replying, setReplying] = useState<number | null>(null);
    const [editing, setEditing] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<CommentNode | null>(null);
    const [moderating, setModerating] = useState<CommentNode | null>(null);
    const [reporting, setReporting] = useState<CommentNode | null>(null);
    const [fresh, setFresh] = useState<number | null>(null);
    const [, tick] = useState(0);
    const { url, props } = usePage();
    const guest = !props.auth.user;
    const [prompt, setPrompt] = useState(false);
    const path = url.split(/[?#]/)[0];

    // As datas relativas ("há 5 minutos") andam sozinhas
    useEffect(() => {
        const timer = window.setInterval(() => tick((n) => n + 1), 60_000);

        return () => window.clearInterval(timer);
    }, []);

    // O comentário recém-publicado aparece na tela e fica destacado um pouco
    useEffect(() => {
        if (fresh === null) {
            return;
        }

        const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
        document.getElementById(`comentario-${fresh}`)?.scrollIntoView({
            block: 'center',
            behavior: calm.matches ? 'auto' : 'smooth',
        });
        const timer = window.setTimeout(() => setFresh(null), FRESH_MS);

        return () => window.clearTimeout(timer);
    }, [fresh]);

    // Trocar de página leva a leitura e o foco ao começo da conversa
    function toTop() {
        const title = document.getElementById('comentarios-titulo');
        title?.scrollIntoView({ block: 'start' });
        title?.focus({ preventScroll: true });
    }

    return (
        <section
            id="comentarios"
            aria-labelledby="comentarios-titulo"
            className="mt-14 flex scroll-mt-24 flex-col gap-2"
        >
            <h2
                id="comentarios-titulo"
                tabIndex={-1}
                className="mb-2 scroll-mt-24 font-display text-[1.625rem] font-extrabold focus:outline-none"
            >
                {t('comments.title')}{' '}
                <span className="font-bold text-text-secondary">
                    ({data.total})
                </span>
            </h2>

            {data.canComment && (
                <CommentForm
                    articleId={articleId}
                    maxLength={data.maxLength}
                    id="novo-comentario"
                    label={t('comments.write')}
                    submit={t('comments.publish')}
                    compact
                    onPosted={setFresh}
                />
            )}

            {guest && (
                <>
                    <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() => setPrompt(true)}
                        className="flex h-12 w-full items-center rounded-2xl border border-border-strong bg-surface px-4 text-left text-body text-text-secondary transition-colors hover:bg-surface-hover"
                    >
                        {t('comments.guest_cta')}
                    </button>
                    <SignInPrompt
                        action="comment"
                        open={prompt}
                        onClose={() => setPrompt(false)}
                    />
                </>
            )}

            {data.total === 0 && data.canComment ? (
                <div className="flex items-center gap-4 py-4">
                    <Mascot art="esperando" size={88} float />
                    <div className="flex flex-col gap-1">
                        <strong className="font-display text-h3 font-extrabold">
                            {t('comments.first.title')}
                        </strong>
                        <span className="text-label text-text-secondary">
                            {t('comments.first.text')}
                        </span>
                    </div>
                </div>
            ) : data.total === 0 ? (
                <p className="py-4 text-label text-text-secondary">
                    {t('comments.empty')}
                </p>
            ) : (
                <ul>
                    {flatten(data.items).map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            articleId={articleId}
                            maxLength={data.maxLength}
                            replying={replying === comment.id}
                            editing={editing === comment.id}
                            fresh={fresh === comment.id}
                            onPosted={setFresh}
                            onReply={(open) =>
                                setReplying(open ? comment.id : null)
                            }
                            onEdit={(open) =>
                                setEditing(open ? comment.id : null)
                            }
                            onDelete={() => setDeleting(comment)}
                            onModerate={() => setModerating(comment)}
                            onReport={() => setReporting(comment)}
                        />
                    ))}
                </ul>
            )}

            <div className="mt-2">
                <Pagination
                    current={data.page}
                    last={data.lastPage}
                    label={t('comments.pages')}
                    href={(page) =>
                        page === 1 ? path : `${path}?comentarios=${page}`
                    }
                    visit={{
                        preserveScroll: true,
                        only: RELOAD,
                        onSuccess: toTop,
                    }}
                />
            </div>

            {reporting && (
                <ReportDialog
                    key={reporting.id}
                    open
                    onClose={() => setReporting(null)}
                    target="comment"
                    id={reporting.id}
                    subject={t('reports.subject.comment', {
                        author: reporting.author.username,
                    })}
                />
            )}
            <DeleteDialog
                comment={deleting}
                onClose={() => setDeleting(null)}
            />
            {policyItems && (
                <ModerateDialog
                    comment={moderating}
                    items={policyItems}
                    onClose={() => setModerating(null)}
                />
            )}
        </section>
    );
}
