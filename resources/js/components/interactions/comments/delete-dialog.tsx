import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import * as comments from '@/routes/comments';
import { flatten } from '@/components/interactions/comments/shared';
import type { CommentNode } from '@/components/interactions/comments/shared';
/** Apagar leva as respostas junto (RF-146), então pede confirmação. */
export default function DeleteDialog({
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
