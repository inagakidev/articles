import { Form } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState } from 'react';
import type { AdminCategory } from '@/components/admin/taxonomy/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { pastelTones } from '@/components/ui/pill';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/admin/categories';
import type { PastelTone } from '@/types';

/** Criar ou renomear uma categoria: nome nos dois idiomas e a cor (D79). */
export default function CategoryDialog({
    category,
    colors,
    open,
    onOpenChange,
}: {
    /** Sem categoria, cria uma nova. */
    category: AdminCategory | null;
    colors: PastelTone[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const [color, setColor] = useState<PastelTone>(
        category?.color ?? colors[0],
    );
    const action = category ? update.form(category.id) : store.form();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle className="font-display text-[1.25rem] font-extrabold">
                    {category
                        ? t('admin.taxonomy.category.form.edit_title', {
                              name: category.namePtBr,
                          })
                        : t('admin.taxonomy.category.form.create_title')}
                </DialogTitle>
                <DialogDescription className="text-meta text-text-secondary">
                    {t('admin.taxonomy.category.form.description')}
                </DialogDescription>
                <Form
                    {...action}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="flex flex-col gap-4"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormField
                                id="name_pt_br"
                                label={t('admin.taxonomy.category.name_pt_br')}
                                error={errors.name_pt_br}
                            >
                                {(field) => (
                                    <Input
                                        {...field}
                                        name="name_pt_br"
                                        lang="pt-BR"
                                        defaultValue={category?.namePtBr}
                                        maxLength={40}
                                        required
                                        autoFocus
                                    />
                                )}
                            </FormField>
                            <FormField
                                id="name_en"
                                label={t('admin.taxonomy.category.name_en')}
                                error={errors.name_en}
                            >
                                {(field) => (
                                    <Input
                                        {...field}
                                        name="name_en"
                                        lang="en"
                                        defaultValue={category?.nameEn}
                                        maxLength={40}
                                        required
                                    />
                                )}
                            </FormField>
                            <fieldset className="flex flex-col gap-2">
                                <legend className="mb-2 text-meta font-bold">
                                    {t('admin.taxonomy.category.color')}
                                </legend>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((option) => (
                                        <label
                                            key={option}
                                            title={t(
                                                `color.${option}` as TranslationKey,
                                            )}
                                            className={cn(
                                                'relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-surface has-checked:ring-2 has-checked:ring-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-focus',
                                                pastelTones[option],
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="color"
                                                value={option}
                                                checked={color === option}
                                                onChange={() =>
                                                    setColor(option)
                                                }
                                                className="sr-only"
                                            />
                                            <span className="sr-only">
                                                {t(
                                                    `color.${option}` as TranslationKey,
                                                )}
                                            </span>
                                            {color === option && (
                                                <Check
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="mt-2 flex flex-wrap justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="md"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('admin.taxonomy.category.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    size="md"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    {t('admin.taxonomy.category.save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
