import { Form } from '@inertiajs/react';
import type { AdminCategory } from '@/components/admin/taxonomy/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import FormField from '@/components/ui/form-field';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { destroy } from '@/routes/admin/categories';

/**
 * Excluir uma categoria (RF-126): com artigos, a pessoa escolhe para onde
 * transferi-los, e o botão diz quantos vão mudar.
 */
export default function DeleteCategoryDialog({
    category,
    others,
    onOpenChange,
}: {
    category: AdminCategory | null;
    /** As categorias que podem receber os artigos. */
    others: AdminCategory[];
    onOpenChange: (open: boolean) => void;
}) {
    const { t, locale } = useTranslation();
    const count = category?.articles ?? 0;
    const name = (option: AdminCategory) =>
        locale === 'en' ? option.nameEn : option.namePtBr;

    return (
        <Dialog open={category !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                {category && (
                    <>
                        <DialogTitle className="font-display text-[1.25rem] font-extrabold">
                            {t('admin.taxonomy.category.delete_title', {
                                name: name(category),
                            })}
                        </DialogTitle>
                        <DialogDescription className="text-meta text-text-secondary">
                            {count === 0
                                ? t('admin.taxonomy.category.delete_empty')
                                : count === 1
                                  ? t(
                                        'admin.taxonomy.category.delete_in_use_one',
                                    )
                                  : t('admin.taxonomy.category.delete_in_use', {
                                        count,
                                    })}
                        </DialogDescription>
                        <Form
                            {...destroy.form(category.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={() => onOpenChange(false)}
                            className="flex flex-col gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {count > 0 && (
                                        <FormField
                                            id="transfer_to"
                                            label={t(
                                                'admin.taxonomy.category.transfer_to',
                                            )}
                                            error={errors.transfer_to}
                                        >
                                            {(field) => (
                                                <select
                                                    {...field}
                                                    name="transfer_to"
                                                    required
                                                    className="h-12 rounded-full border border-border-strong bg-surface px-5 text-body text-text-primary"
                                                >
                                                    {others.map((option) => (
                                                        <option
                                                            key={option.id}
                                                            value={option.id}
                                                        >
                                                            {name(option)}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </FormField>
                                    )}
                                    <div className="mt-2 flex flex-wrap justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="md"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            {t(
                                                'admin.taxonomy.category.cancel',
                                            )}
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            size="md"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            {count === 0
                                                ? t(
                                                      'admin.taxonomy.category.delete_submit',
                                                  )
                                                : count === 1
                                                  ? t(
                                                        'admin.taxonomy.category.delete_submit_transfer_one',
                                                    )
                                                  : t(
                                                        'admin.taxonomy.category.delete_submit_transfer',
                                                        { count },
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
    );
}
