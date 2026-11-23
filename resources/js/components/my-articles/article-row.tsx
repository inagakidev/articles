import { Link } from '@inertiajs/react';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import { edit, preview } from '@/routes/articles';

/**
 * Uma linha de Meus artigos (prancha "Meus artigos"): selo, título que
 * leva ao editor, meta, ações da seção e "Mais ações". O que vem abaixo
 * (a justificativa de uma rejeição) entra como `children`.
 */
export default function ArticleRow({
    id,
    title,
    badge,
    meta,
    actions,
    onTrash,
    children,
}: {
    id: number;
    title: string | null;
    badge?: ReactNode;
    meta: string;
    actions: ReactNode;
    onTrash: () => void;
    children?: ReactNode;
}) {
    const { t } = useTranslation();
    const name = title || t('my_articles.untitled');

    return (
        <li
            id={`article-${id}`}
            tabIndex={-1}
            className="flex flex-col gap-3.5 rounded-inner border border-border bg-surface px-5 py-4.5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-1.5">
                    {badge}
                    <h3 className="font-display text-[1.1875rem] leading-[1.625rem] font-bold">
                        <Link
                            href={edit(id)}
                            className="rounded-sm text-text-primary hover:underline"
                        >
                            {title || <em>{t('my_articles.untitled')}</em>}
                        </Link>
                    </h3>
                    <span className="text-meta text-text-secondary">
                        {meta}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            aria-label={t('my_articles.more', { title: name })}
                            className="inline-flex size-10 items-center justify-center rounded-full text-text-primary hover:bg-surface-hover"
                        >
                            <MoreHorizontal
                                aria-hidden="true"
                                className="size-5"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={preview(id)}>
                                    <Eye aria-hidden="true" />
                                    {t('my_articles.preview')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={onTrash}>
                                <Trash2 aria-hidden="true" />
                                {t('my_articles.trash')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {children}
        </li>
    );
}
