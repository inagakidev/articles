import { Form, Link, router } from '@inertiajs/react';
import {
    Ban,
    Merge,
    Search,
    ShieldCheck,
    Tag as TagIcon,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { AdminTag, Paginated } from '@/components/admin/taxonomy/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import EmptyState from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import Pill from '@/components/ui/pill';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/lib/i18n';
import { taxonomy } from '@/routes/admin';
import { block, destroy, merge, unblock } from '@/routes/admin/tags';

/** Tags (RF-127 a RF-129): busca, estado, bloquear, unir e excluir. */
export default function TagsSection({
    tags,
    search,
}: {
    tags: Paginated<AdminTag>;
    search: string;
}) {
    const { t } = useTranslation();
    const [query, setQuery] = useState(search);
    const [deleting, setDeleting] = useState<AdminTag | null>(null);

    return (
        <section
            aria-labelledby="tags-title"
            className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5 sm:p-6"
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2
                    id="tags-title"
                    className="font-display text-[1.125rem] font-extrabold"
                >
                    {t('admin.taxonomy.tags.title')}
                </h2>
                <form
                    role="search"
                    onSubmit={(event) => {
                        event.preventDefault();
                        router.get(
                            taxonomy().url,
                            query ? { tag: query } : {},
                            { preserveState: true, preserveScroll: true },
                        );
                    }}
                    className="relative w-full sm:w-72"
                >
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-text-secondary"
                    />
                    <Input
                        type="search"
                        name="tag"
                        aria-label={t('admin.taxonomy.tags.search')}
                        placeholder={t('admin.taxonomy.tags.search')}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="h-11 pl-10"
                    />
                </form>
            </div>

            {tags.data.length === 0 ? (
                search ? (
                    <EmptyState
                        Icon={Search}
                        title={t('admin.taxonomy.tags.no_results.title', {
                            search,
                        })}
                        text={t('admin.taxonomy.tags.no_results.text')}
                        action={
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={taxonomy()}
                                    preserveScroll
                                    onClick={() => setQuery('')}
                                >
                                    {t('admin.taxonomy.tags.no_results.clear')}
                                </Link>
                            </Button>
                        }
                    />
                ) : (
                    <EmptyState
                        Icon={TagIcon}
                        title={t('admin.taxonomy.tags.empty.title')}
                        text={t('admin.taxonomy.tags.empty.text')}
                    />
                )
            ) : (
                <div className="relative overflow-x-auto">
                    <table className="w-full min-w-150 text-left text-meta">
                        <thead className="text-caption font-bold text-text-secondary">
                            <tr className="border-b border-border">
                                <th
                                    scope="col"
                                    className="py-2.5 pr-3 font-bold"
                                >
                                    {t('admin.taxonomy.tags.column.tag')}
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
                                    className="px-3 py-2.5 font-bold"
                                >
                                    {t('admin.taxonomy.tags.column.state')}
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
                            {tags.data.map((tag) => (
                                <TagRow
                                    key={tag.id}
                                    tag={tag}
                                    onDelete={() => setDeleting(tag)}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tags.last_page > 1 && (
                <nav
                    aria-label={t('admin.taxonomy.pagination.label')}
                    className="flex items-center justify-between gap-3 text-meta"
                >
                    <PageLink href={tags.prev_page_url}>
                        {t('admin.taxonomy.pagination.previous')}
                    </PageLink>
                    <span className="text-text-secondary">
                        {t('admin.taxonomy.pagination.status', {
                            current: tags.current_page,
                            last: tags.last_page,
                        })}
                    </span>
                    <PageLink href={tags.next_page_url}>
                        {t('admin.taxonomy.pagination.next')}
                    </PageLink>
                </nav>
            )}

            <p className="text-caption text-text-secondary">
                {t('admin.taxonomy.tags.hint')}
            </p>

            <DeleteTagDialog
                tag={deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
            />
        </section>
    );
}

function TagRow({ tag, onDelete }: { tag: AdminTag; onDelete: () => void }) {
    const { t } = useTranslation();

    return (
        <tr className="border-b border-border last:border-b-0">
            <th scope="row" className="py-3 pr-3 font-mono font-bold">
                {tag.name}
            </th>
            <td className="px-3 py-3">{tag.articles}</td>
            <td className="px-3 py-3">
                {tag.blocked ? (
                    <Pill tone="pink">
                        <Ban aria-hidden="true" className="size-3.5" />
                        {t('admin.taxonomy.tag.blocked_state')}
                    </Pill>
                ) : tag.mergeInto ? (
                    <Pill tone="yellow">
                        {t('admin.taxonomy.tag.similar', {
                            name: tag.mergeInto.name,
                        })}
                    </Pill>
                ) : (
                    <Pill tone="mint">
                        <ShieldCheck aria-hidden="true" className="size-3.5" />
                        {t('admin.taxonomy.tag.normalized')}
                    </Pill>
                )}
            </td>
            <td className="py-3 pl-3">
                <div className="flex flex-wrap justify-end gap-1">
                    {tag.mergeInto && !tag.blocked && (
                        <Button asChild variant="subtle" size="sm">
                            <Link
                                href={merge(tag.id)}
                                data={{ target_id: tag.mergeInto.id }}
                                as="button"
                                preserveScroll
                                aria-label={t(
                                    'admin.taxonomy.tag.merge_label',
                                    {
                                        name: tag.name,
                                        target: tag.mergeInto.name,
                                    },
                                )}
                            >
                                <Merge aria-hidden="true" />
                                {t('admin.taxonomy.tag.merge')}
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="subtle" size="sm">
                        <Link
                            href={tag.blocked ? unblock(tag.id) : block(tag.id)}
                            as="button"
                            preserveScroll
                            aria-label={t(
                                tag.blocked
                                    ? 'admin.taxonomy.tag.unblock_label'
                                    : 'admin.taxonomy.tag.block_label',
                                { name: tag.name },
                            )}
                        >
                            {t(
                                tag.blocked
                                    ? 'admin.taxonomy.tag.unblock'
                                    : 'admin.taxonomy.tag.block',
                            )}
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={onDelete}
                        aria-label={t('admin.taxonomy.tag.delete_label', {
                            name: tag.name,
                        })}
                    >
                        <Trash2 aria-hidden="true" />
                        {t('admin.taxonomy.tag.delete')}
                    </Button>
                </div>
            </td>
        </tr>
    );
}

function PageLink({
    href,
    children,
}: {
    href: string | null;
    children: React.ReactNode;
}) {
    return href ? (
        <Button asChild variant="outline" size="sm">
            <Link href={href} preserveScroll preserveState>
                {children}
            </Link>
        </Button>
    ) : (
        <Button variant="outline" size="sm" disabled>
            {children}
        </Button>
    );
}

function DeleteTagDialog({
    tag,
    onOpenChange,
}: {
    tag: AdminTag | null;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();

    return (
        <Dialog open={tag !== null} onOpenChange={onOpenChange}>
            <DialogContent>
                {tag && (
                    <>
                        <DialogTitle className="font-display text-[1.25rem] font-extrabold">
                            {t('admin.taxonomy.tag.delete_title', {
                                name: tag.name,
                            })}
                        </DialogTitle>
                        <DialogDescription className="text-meta text-text-secondary">
                            {t('admin.taxonomy.tag.delete_text')}
                        </DialogDescription>
                        <Form
                            {...destroy.form(tag.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={() => onOpenChange(false)}
                            className="flex flex-wrap justify-end gap-2"
                        >
                            {({ processing }) => (
                                <>
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
                                        variant="destructive"
                                        size="md"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        {t('admin.taxonomy.tag.delete')}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
