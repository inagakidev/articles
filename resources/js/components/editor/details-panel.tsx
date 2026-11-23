import type { ReactNode } from 'react';
import type { DraftFields } from '@/hooks/use-autosave';
import TagsInput from '@/components/editor/tags-input';
import FormField from '@/components/ui/form-field';
import SegmentedControl from '@/components/ui/segmented-control';
import { localeNames, locales, useTranslation } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';
import type { PastelTone } from '@/types';

export type EditorCategory = { id: number; name: string; color: PastelTone };

/** Capa, categoria, idioma e tags do artigo (RF-079, RF-092 a RF-094). */
export default function DetailsPanel({
    cover,
    fields,
    categories,
    maxTags,
    errors,
    isNew,
    onChange,
}: {
    /** O campo de capa, que a página liga ao envio de imagem. */
    cover: ReactNode;
    fields: Pick<DraftFields, 'language' | 'category_id' | 'tags'>;
    categories: EditorCategory[];
    maxTags: number;
    errors: Record<string, string>;
    isNew: boolean;
    onChange: (fields: Partial<DraftFields>) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4">
            {cover}
            <FormField
                id="category"
                label={t('editor.details.category')}
                error={errors.category_id}
            >
                {(field) => (
                    <select
                        {...field}
                        value={fields.category_id ?? ''}
                        onChange={(event) =>
                            onChange({
                                category_id: event.target.value
                                    ? Number(event.target.value)
                                    : null,
                            })
                        }
                        className="h-12 rounded-full border border-border-strong bg-surface px-5 text-body text-text-primary"
                    >
                        <option value="">
                            {t('editor.details.category_placeholder')}
                        </option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                )}
            </FormField>

            <div className="flex flex-col gap-1.5">
                <span id="language-label" className="text-meta font-bold">
                    {t('editor.details.language')}
                </span>
                <SegmentedControl<Locale>
                    name="article-language"
                    label={t('editor.details.language')}
                    value={(fields.language ?? '') as Locale}
                    options={locales.map((locale) => ({
                        value: locale,
                        label: localeNames[locale].name,
                        lang: locale.replace('_', '-'),
                    }))}
                    onChange={(language) => onChange({ language })}
                    className="self-start"
                />
                {isNew && (
                    <span className="text-caption text-text-secondary">
                        {t('editor.details.language_hint')}
                    </span>
                )}
            </div>

            <FormField
                id="tags"
                label={
                    <>
                        {t('editor.details.tags')}{' '}
                        <span className="font-normal text-text-secondary">
                            {t('editor.details.optional')}
                        </span>
                    </>
                }
                error={errors.tags}
                hint={t('editor.details.tags_hint', { max: maxTags })}
            >
                {(field) => (
                    <TagsInput
                        id={field.id}
                        describedBy={field['aria-describedby']}
                        value={fields.tags}
                        max={maxTags}
                        onChange={(tags) => onChange({ tags })}
                    />
                )}
            </FormField>
        </div>
    );
}
