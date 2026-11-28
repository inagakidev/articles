import { Link } from '@inertiajs/react';
import {
    Flag,
    MoreHorizontal,
    Pencil,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import LikeButton from '@/components/interactions/like-button';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store as likeComment } from '@/routes/likes/comment';
import { show as profile } from '@/routes/profiles';
import CommentForm from '@/components/interactions/comments/comment-form';
import EditForm from '@/components/interactions/comments/edit-form';
import { RELOAD, when } from '@/components/interactions/comments/shared';
import type { CommentNode } from '@/components/interactions/comments/shared';
export default function CommentItem({
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
    onReport,
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
    onReport: () => void;
}) {
    const { t, locale } = useTranslation();
    const nested = comment.depth > 1;
    const hasMenu =
        comment.can.edit ||
        comment.can.delete ||
        comment.can.moderate ||
        comment.can.report;

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
                                        {comment.can.report && (
                                            <DropdownMenuItem
                                                onSelect={onReport}
                                                disabled={comment.reported}
                                            >
                                                <Flag aria-hidden="true" />
                                                {comment.reported
                                                    ? t('reports.already')
                                                    : t(
                                                          'reports.action.comment',
                                                      )}
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
