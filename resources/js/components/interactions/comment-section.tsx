import { Form, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    MoreHorizontal,
    Pencil,
    Send,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import LikeButton from '@/components/interactions/like-button';
import DecisionFields from '@/components/moderation/decision-fields';
import type { PolicyItem } from '@/components/moderation/decision-fields';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InputError from '@/components/ui/input-error';
import Mascot from '@/components/ui/mascot';
import Pagination from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import UserAvatar from '@/components/ui/user-avatar';
import { relative, shortDate } from '@/lib/dates';
import type { Locale } from '@/lib/i18n';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as comments from '@/routes/comments';
import { store as likeComment } from '@/routes/likes/comment';
import { show as profile } from '@/routes/profiles';

export type CommentNode = {
    id: number;
    body: string;
    depth: number;
    createdAt: string | null;
    edited: boolean;
    author: { name: string; username: string; avatar: string | null };
    isArticleAuthor: boolean;
    own: boolean;
    likes: { count: number; liked: boolean };
    can: {
        like: boolean;
        reply: boolean;
        edit: boolean;
        delete: boolean;
        moderate: boolean;
    };
    replies: CommentNode[];
};

export type CommentsData = {
    total: number;
    items: CommentNode[];
    /** Página da conversa, de 5 comentários de primeiro nível cada (D88). */
    page: number;
    lastPage: number;
    canComment: boolean;
    maxLength: number;
};

/** As props que a leitura recarrega depois de mexer nos comentários. */
const RELOAD = ['comments'];

/** A árvore em ordem de leitura, cada um com o próprio nível. */
function flatten(nodes: CommentNode[]): CommentNode[] {
    return nodes.flatMap((node) => [node, ...flatten(node.replies)]);
}

/** A partir de quanto do limite o contador aparece. */
const COUNTER_FROM = 0.9;

/** Quanto tempo o comentário recém-publicado fica destacado. */
const FRESH_MS = 2400;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** "agora", "há 5 minutos", "ontem"; depois de uma semana, "14 nov". */
function when(iso: string, locale: Locale): string {
    return Date.now() - new Date(iso).getTime() < WEEK_MS
        ? relative(iso, locale)
        : shortDate(iso, locale);
}

/**
 * Comentários da leitura (prancha "Comentários · logada", RF-138 a RF-147):
 * qualquer pessoa lê; quem tem conta confirmada escreve, responde até 3
 * níveis, curte, edita e apaga. Para quem não participa, nem formulário nem
 * convite (RF-141).
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
    const [fresh, setFresh] = useState<number | null>(null);
    const [, tick] = useState(0);
    const { url } = usePage();
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

function CommentForm({
    articleId,
    maxLength,
    id,
    label,
    submit,
    parent,
    onCancel,
    compact = false,
    onPosted,
}: {
    articleId: number;
    maxLength: number;
    id: string;
    label: string;
    submit: string;
    parent?: CommentNode;
    onCancel?: () => void;
    /** Começa numa linha e abre ao focar (o campo da conversa). */
    compact?: boolean;
    /** Recebe o comentário publicado, para destacá-lo. */
    onPosted?: (id: number) => void;
}) {
    const { t, locale } = useTranslation();
    const { auth, comments: current } = usePage<{
        comments?: CommentsData;
    }>().props;
    const form = useForm({ body: '', parent_id: parent?.id ?? null });
    const [focused, setFocused] = useState(false);
    const open = !compact || focused || form.data.body !== '';
    const empty = form.data.body.trim() === '';

    function send(event?: FormEvent) {
        event?.preventDefault();

        if (empty || form.processing) {
            return;
        }

        // O publicado é o que não estava na conversa antes
        const before = new Set(flatten(current?.items ?? []).map((c) => c.id));

        form.post(comments.store(articleId).url, {
            preserveScroll: true,
            only: RELOAD,
            onSuccess: (page) => {
                form.reset();
                onCancel?.();
                const after = flatten(
                    (page.props.comments as CommentsData | undefined)?.items ??
                        [],
                );
                const posted = after.find((c) => !before.has(c.id));

                if (posted) {
                    onPosted?.(posted.id);
                }
            },
        });
    }

    // Ctrl + Enter (⌘ + Enter no Mac) publica
    function shortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            send();
        }
    }

    const tag = locale.replace('_', '-');
    const length = form.data.body.length;
    const showCounter = length >= maxLength * COUNTER_FROM;
    const counter = `${length.toLocaleString(tag)} / ${maxLength.toLocaleString(tag)}`;
    const describedBy = [
        `${id}-dica`,
        showCounter && `${id}-contagem`,
        form.errors.body && `${id}-erro`,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <form onSubmit={send} className="flex gap-3 py-1">
            {!parent && auth.user && (
                <UserAvatar
                    name={auth.user.name}
                    avatar={auth.user.avatar ?? null}
                    className="size-10 text-caption"
                />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                {parent && (
                    <span className="text-meta text-text-secondary">
                        {t('comments.replying_to')}{' '}
                        <strong className="text-text-primary">
                            {parent.author.name}
                        </strong>
                    </span>
                )}
                <label htmlFor={id} className="sr-only">
                    {label}
                </label>
                <textarea
                    id={id}
                    rows={parent ? 2 : open ? 3 : 1}
                    value={form.data.body}
                    onChange={(event) =>
                        form.setData('body', event.target.value)
                    }
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={shortcut}
                    maxLength={maxLength}
                    placeholder={label}
                    autoFocus={parent !== undefined}
                    aria-invalid={form.errors.body ? true : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'w-full resize-none rounded-2xl border border-border-strong bg-surface px-4 py-3 text-body text-text-primary transition-[height] duration-200 placeholder:text-text-secondary focus-visible:outline-offset-[-1px]',
                        // Fechado, uma linha só, sem barra de rolagem
                        compact &&
                            (open
                                ? 'h-28'
                                : 'h-12 overflow-hidden leading-6 whitespace-nowrap'),
                    )}
                />
                <InputError id={`${id}-erro`} message={form.errors.body} />
                <div
                    className={cn(
                        'flex flex-wrap items-center gap-2',
                        !open && 'sr-only',
                    )}
                >
                    <span
                        id={`${id}-dica`}
                        className="text-caption text-text-secondary"
                    >
                        {t('comments.public')}
                        <span className="hidden sm:inline">
                            {' '}
                            {t('comments.shortcut')}
                        </span>
                    </span>
                    {showCounter && (
                        <span
                            id={`${id}-contagem`}
                            className={cn(
                                'text-caption font-bold',
                                length >= maxLength
                                    ? 'text-danger-fg'
                                    : 'text-warning-fg',
                            )}
                        >
                            {counter}
                        </span>
                    )}
                    <span className="ml-auto" />
                    {onCancel && (
                        <Button
                            type="button"
                            variant="subtle"
                            size="sm"
                            onClick={onCancel}
                        >
                            {t('moderation.cancel')}
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={form.processing || empty}
                        className="[&_svg]:transition-transform hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5"
                    >
                        {form.processing ? (
                            <Spinner />
                        ) : (
                            <Send aria-hidden="true" />
                        )}
                        {submit}
                    </Button>
                </div>
            </div>
        </form>
    );
}

function CommentItem({
    comment,
    articleId,
    maxLength,
    replying,
    editing,
    fresh,
    onPosted,
    onReply,
    onEdit,
    onDelete,
    onModerate,
}: {
    comment: CommentNode;
    articleId: number;
    maxLength: number;
    replying: boolean;
    editing: boolean;
    /** Acabou de ser publicado: entra destacado. */
    fresh: boolean;
    onPosted: (id: number) => void;
    onReply: (open: boolean) => void;
    onEdit: (open: boolean) => void;
    onDelete: () => void;
    onModerate: () => void;
}) {
    const { t, locale } = useTranslation();
    const nested = comment.depth > 1;
    const hasMenu =
        comment.can.edit || comment.can.delete || comment.can.moderate;

    return (
        <>
            <li
                id={`comentario-${comment.id}`}
                className={cn(
                    'flex gap-3.5 rounded-xl py-3.5',
                    nested && 'rounded-l-none border-l-2 border-border pl-4.5',
                    fresh && 'comment-new',
                )}
                style={
                    nested
                        ? { marginLeft: `${(comment.depth - 1) * 2.75}rem` }
                        : undefined
                }
            >
                <UserAvatar
                    name={comment.author.name}
                    avatar={comment.author.avatar}
                    className="size-10 shrink-0 text-caption"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={profile({
                                username: comment.author.username,
                            })}
                            className="text-[0.9375rem] font-bold hover:underline"
                        >
                            {comment.author.name}
                        </Link>
                        {comment.isArticleAuthor && (
                            <span className="rounded-md bg-surface-selected px-2 text-badge font-bold text-text-on-selected">
                                {t('comments.badge_author')}
                            </span>
                        )}
                        {comment.own && (
                            <span className="rounded-md bg-surface-muted px-2 text-badge font-bold">
                                {t('comments.badge_you')}
                            </span>
                        )}
                        {comment.createdAt && (
                            <span className="text-caption text-text-secondary">
                                <time
                                    dateTime={comment.createdAt}
                                    title={new Date(
                                        comment.createdAt,
                                    ).toLocaleString(locale.replace('_', '-'))}
                                >
                                    {when(comment.createdAt, locale)}
                                </time>
                                {comment.edited && ` · ${t('comments.edited')}`}
                            </span>
                        )}
                    </div>

                    {editing ? (
                        <EditForm
                            comment={comment}
                            maxLength={maxLength}
                            onDone={() => onEdit(false)}
                        />
                    ) : (
                        <p className="text-body leading-[1.625rem] break-words whitespace-pre-line">
                            {comment.body}
                        </p>
                    )}

                    {!editing && (
                        <div className="-ml-2.5 flex items-center gap-1">
                            <LikeButton
                                count={comment.likes.count}
                                liked={comment.likes.liked}
                                canLike={comment.can.like}
                                url={likeComment(comment.id).url}
                                reload={RELOAD}
                                label={t('likes.comment')}
                                ownHint={
                                    comment.own
                                        ? t('likes.own_comment')
                                        : undefined
                                }
                                size="sm"
                            />
                            {comment.can.reply && (
                                <Button
                                    type="button"
                                    variant="subtle"
                                    size="sm"
                                    aria-expanded={replying}
                                    onClick={() => onReply(!replying)}
                                >
                                    {t('comments.reply')}
                                </Button>
                            )}
                            {hasMenu && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        aria-label={t('comments.more', {
                                            name: comment.author.name,
                                        })}
                                        className="ml-auto inline-flex size-8 items-center justify-center rounded-xl text-text-secondary hover:bg-surface-hover"
                                    >
                                        <MoreHorizontal
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {comment.can.edit && (
                                            <DropdownMenuItem
                                                onSelect={() => onEdit(true)}
                                            >
                                                <Pencil aria-hidden="true" />
                                                {t('comments.edit')}
                                            </DropdownMenuItem>
                                        )}
                                        {comment.can.delete && (
                                            <DropdownMenuItem
                                                onSelect={onDelete}
                                                className="text-danger-fg"
                                            >
                                                <Trash2 aria-hidden="true" />
                                                {t('comments.delete')}
                                            </DropdownMenuItem>
                                        )}
                                        {comment.can.moderate &&
                                            !comment.can.delete && (
                                                <DropdownMenuItem
                                                    onSelect={onModerate}
                                                    className="text-danger-fg"
                                                >
                                                    <ShieldAlert aria-hidden="true" />
                                                    {t('comments.moderate')}
                                                </DropdownMenuItem>
                                            )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}
                </div>
            </li>
            {replying && (
                <li
                    className="border-l-2 border-border py-2 pl-4.5"
                    style={{ marginLeft: `${comment.depth * 2.75}rem` }}
                >
                    <CommentForm
                        articleId={articleId}
                        maxLength={maxLength}
                        id={`responder-${comment.id}`}
                        label={t('comments.write_reply')}
                        submit={t('comments.reply')}
                        parent={comment}
                        onCancel={() => onReply(false)}
                        onPosted={onPosted}
                    />
                </li>
            )}
        </>
    );
}

function EditForm({
    comment,
    maxLength,
    onDone,
}: {
    comment: CommentNode;
    maxLength: number;
    onDone: () => void;
}) {
    const { t } = useTranslation();
    const form = useForm({ body: comment.body });
    const id = `editar-${comment.id}`;

    function save(event: FormEvent) {
        event.preventDefault();
        form.put(comments.update(comment.id).url, {
            preserveScroll: true,
            only: RELOAD,
            onSuccess: onDone,
        });
    }

    return (
        <form onSubmit={save} className="mt-0.5 flex flex-col gap-2">
            <label htmlFor={id} className="sr-only">
                {t('comments.edit_label')}
            </label>
            <textarea
                id={id}
                rows={3}
                value={form.data.body}
                onChange={(event) => form.setData('body', event.target.value)}
                maxLength={maxLength}
                autoFocus
                aria-invalid={form.errors.body ? true : undefined}
                aria-describedby={form.errors.body ? `${id}-erro` : undefined}
                className="w-full resize-y rounded-xl border border-border-strong bg-surface px-3.5 py-3 text-body focus-visible:outline-offset-[-1px]"
            />
            <InputError id={`${id}-erro`} message={form.errors.body} />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    onClick={onDone}
                >
                    {t('moderation.cancel')}
                </Button>
                <Button
                    type="submit"
                    size="sm"
                    disabled={form.processing || form.data.body.trim() === ''}
                >
                    {form.processing && <Spinner />}
                    {t('comments.save')}
                </Button>
            </div>
        </form>
    );
}

/** Apagar leva as respostas junto (RF-146), então pede confirmação. */
function DeleteDialog({
    comment,
    onClose,
}: {
    comment: CommentNode | null;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);
    const replies = comment ? flatten(comment.replies).length : 0;

    function remove() {
        if (!comment) {
            return;
        }

        setProcessing(true);
        router.delete(comments.destroy(comment.id).url, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                onClose();
            },
        });
    }

    return (
        <Dialog
            open={comment !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="rounded-card sm:max-w-md">
                <DialogTitle className="font-display text-h3 font-extrabold">
                    {t('comments.delete_title')}
                </DialogTitle>
                <DialogDescription className="text-meta text-text-secondary">
                    {replies === 0
                        ? t('comments.delete_text')
                        : replies === 1
                          ? t('comments.delete_text_reply')
                          : t('comments.delete_text_replies', {
                                count: replies,
                            })}
                </DialogDescription>
                <div className="mt-2 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={onClose}
                    >
                        {t('moderation.cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="md"
                        disabled={processing}
                        onClick={remove}
                    >
                        {processing && <Spinner />}
                        {t('comments.delete')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/** A administradora apaga o comentário de outra pessoa como moderação (RF-145). */
function ModerateDialog({
    comment,
    items,
    onClose,
}: {
    comment: CommentNode | null;
    items: PolicyItem[];
    onClose: () => void;
}) {
    const { t } = useTranslation();

    return (
        <Dialog
            open={comment !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="rounded-card sm:max-w-lg">
                {comment && (
                    <>
                        <DialogTitle className="font-display text-h3 font-extrabold">
                            {t('comments.moderate_title')}
                        </DialogTitle>
                        <DialogDescription className="text-meta text-text-secondary">
                            {t('comments.moderate_text', {
                                name: comment.author.name,
                            })}
                        </DialogDescription>
                        <Form
                            {...comments.moderate.form(comment.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={onClose}
                            className="flex flex-col gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <DecisionFields
                                        idPrefix={`moderar-comentario-${comment.id}`}
                                        items={items}
                                        errors={errors}
                                        reasonHint={t('comments.moderate_hint')}
                                    />
                                    <div className="mt-2 flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="md"
                                            onClick={onClose}
                                        >
                                            {t('moderation.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            size="md"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            {t('comments.delete')}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
