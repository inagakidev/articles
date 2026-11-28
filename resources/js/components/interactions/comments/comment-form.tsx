import { useForm, usePage } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-error';
import { Spinner } from '@/components/ui/spinner';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as comments from '@/routes/comments';
import {
    RELOAD,
    flatten,
    COUNTER_FROM,
} from '@/components/interactions/comments/shared';
import type {
    CommentNode,
    CommentsData,
} from '@/components/interactions/comments/shared';
export default function CommentForm({
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
