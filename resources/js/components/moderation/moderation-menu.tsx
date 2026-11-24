import { Form } from '@inertiajs/react';
import { EyeOff, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { destroy, unpublish } from '@/routes/admin/articles';

type Action = 'unpublish' | 'delete';

/**
 * "Moderação" na leitura, só para a administradora (D87): despublicar
 * (RF-111) ou excluir de vez (RF-122), cada um com o item da Política e a
 * justificativa, que a autora recebe por e-mail.
 */
export default function ModerationMenu({
    articleId,
    policyItems,
}: {
    articleId: number;
    policyItems: PolicyItem[];
}) {
    const { t } = useTranslation();
    const [action, setAction] = useState<Action | null>(null);
    const form =
        action === 'delete'
            ? destroy.form(articleId)
            : unpublish.form(articleId);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="md">
                        <ShieldAlert aria-hidden="true" />
                        {t('moderation.menu')}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onSelect={() => setAction('unpublish')}>
                        <EyeOff aria-hidden="true" />
                        {t('moderation.unpublish.action')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => setAction('delete')}
                        className="text-danger-fg"
                    >
                        <Trash2 aria-hidden="true" />
                        {t('moderation.delete.action')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={action !== null}
                onOpenChange={(open) => !open && setAction(null)}
            >
                <DialogContent className="rounded-card sm:max-w-lg">
                    {action && (
                        <>
                            <DialogTitle className="font-display text-h3 font-extrabold">
                                {t(`moderation.${action}.title`)}
                            </DialogTitle>
                            <DialogDescription className="text-meta text-text-secondary">
                                {t(`moderation.${action}.text`)}
                            </DialogDescription>
                            <Form
                                key={action}
                                {...form}
                                className="flex flex-col gap-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <DecisionFields
                                            idPrefix={`moderar-${action}`}
                                            items={policyItems}
                                            errors={errors}
                                            reasonHint={t(
                                                'moderation.reason_hint',
                                            )}
                                        />
                                        <div className="mt-2 flex flex-wrap justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="md"
                                                onClick={() => setAction(null)}
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
                                                {t(
                                                    `moderation.${action}.submit`,
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
