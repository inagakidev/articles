import { Head } from '@inertiajs/react';
import { PenLine, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CategoryDialog from '@/components/admin/taxonomy/category-dialog';
import DeleteCategoryDialog from '@/components/admin/taxonomy/delete-category-dialog';
import TagsSection from '@/components/admin/taxonomy/tags-section';
import type {
    AdminCategory,
    AdminTag,
    Paginated,
} from '@/components/admin/taxonomy/types';
import { Button } from '@/components/ui/button';
import Pill from '@/components/ui/pill';
import { useTranslation } from '@/lib/i18n';
import type { PastelTone } from '@/types';

type Props = {
    categories: AdminCategory[];
    colors: PastelTone[];
    tags: Paginated<AdminTag>;
    search: string;
};

/** "Categorias e tags" (prancha "Admin · Categorias e tags", RF-124 a RF-129). */
export default function Taxonomy({ categories, colors, tags, search }: Props) {
    const { t, locale } = useTranslation();
    const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null);
    const [deleting, setDeleting] = useState<AdminCategory | null>(null);
    const name = (category: AdminCategory) =>
        locale === 'en' ? category.nameEn : category.namePtBr;

    return (
        <>
            <Head title={t('admin.taxonomy.title')} />

            <h1 className="font-display text-[1.875rem]/[2.375rem] font-extrabold tracking-[-0.02em]">
                {t('admin.taxonomy.title')}
            </h1>

            <section
                aria-labelledby="categories-title"
                className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 sm:p-6"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="categories-title"
                        className="font-display text-[1.125rem] font-extrabold"
                    >
                        {t('admin.taxonomy.categories.title')}
                    </h2>
                    <Button size="sm" onClick={() => setEditing('new')}>
                        <Plus aria-hidden="true" />
                        {t('admin.taxonomy.categories.new')}
                    </Button>
                </div>
                <div className="relative overflow-x-auto">
                    <table className="w-full min-w-120 text-left text-meta">
                        <thead className="text-caption font-bold text-text-secondary">
                            <tr className="border-b border-border">
                                <th
                                    scope="col"
                                    className="py-2.5 pr-3 font-bold"
                                >
                                    {t('admin.taxonomy.categories.column.name')}
                                </th>
                                <th
                                    scope="col"
                                    className="px-3 py-2.5 font-bold"
                                >
                                    {t(
                                        'admin.taxonomy.categories.column.articles',
                                    )}
                                </th>
                                <th
                                    scope="col"
                                    className="py-2.5 pl-3 text-right font-bold"
                                >
                                    {t('admin.taxonomy.column.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-b border-border last:border-b-0"
                                >
                                    <th
                                        scope="row"
                                        className="py-3 pr-3 font-normal"
                                    >
                                        <Pill tone={category.color}>
                                            {name(category)}
                                        </Pill>
                                    </th>
                                    <td className="px-3 py-3 text-text-secondary">
                                        {category.articles === 1
                                            ? t(
                                                  'admin.taxonomy.category.articles_one',
                                              )
                                            : t(
                                                  'admin.taxonomy.category.articles',
                                                  {
                                                      count: category.articles,
                                                  },
                                              )}
                                    </td>
                                    <td className="py-3 pl-3">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="subtle"
                                                size="sm"
                                                onClick={() =>
                                                    setEditing(category)
                                                }
                                                aria-label={t(
                                                    'admin.taxonomy.category.rename_label',
                                                    { name: name(category) },
                                                )}
                                            >
                                                <PenLine aria-hidden="true" />
                                                {t(
                                                    'admin.taxonomy.category.rename',
                                                )}
                                            </Button>
                                            <Button
                                                variant="subtle"
                                                size="sm"
                                                onClick={() =>
                                                    setDeleting(category)
                                                }
                                                disabled={
                                                    categories.length < 2 &&
                                                    category.articles > 0
                                                }
                                                aria-label={t(
                                                    'admin.taxonomy.category.delete_label',
                                                    { name: name(category) },
                                                )}
                                            >
                                                <Trash2 aria-hidden="true" />
                                                {t(
                                                    'admin.taxonomy.category.delete',
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <TagsSection tags={tags} search={search} />

            {editing !== null && (
                <CategoryDialog
                    key={editing === 'new' ? 'new' : editing.id}
                    category={editing === 'new' ? null : editing}
                    colors={colors}
                    open
                    onOpenChange={(open) => !open && setEditing(null)}
                />
            )}
            <DeleteCategoryDialog
                category={deleting}
                others={categories.filter(
                    (category) => category.id !== deleting?.id,
                )}
                onOpenChange={(open) => !open && setDeleting(null)}
            />
        </>
    );
}
