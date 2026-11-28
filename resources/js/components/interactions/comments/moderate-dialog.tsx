import { Form } from '@inertiajs/react';
import DecisionFields from '@/components/moderation/decision-fields';
import type { PolicyItem } from '@/components/moderation/decision-fields';
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
import type { CommentNode } from '@/components/interactions/comments/shared';
/** A administradora apaga o comentário de outra pessoa como moderação (RF-145). */
export default function ModerateDialog({
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
