import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-error';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import * as comments from '@/routes/comments';
import { RELOAD } from '@/components/interactions/comments/shared';
import type { CommentNode } from '@/components/interactions/comments/shared';
export default function EditForm({
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
