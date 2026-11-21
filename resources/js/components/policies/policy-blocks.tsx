import { Info } from 'lucide-react';
import RichText from '@/components/policies/rich-text';
import type { PolicyBlock, PolicyItem } from '@/components/policies/types';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Âncora de um item da Política de conteúdo: "4.2" vira "item-4-2". */
export const itemAnchor = (id: string) => `item-${id.replace('.', '-')}`;

/** Os blocos de uma seção: parágrafo, lista, nota, tabela ou itens numerados. */
export default function PolicyBlocks({
    blocks,
    highlight,
}: {
    blocks: PolicyBlock[];
    /** Item citado pela moderação, destacado (RF-107). */
    highlight?: string | null;
}) {
    return (
        <>
            {blocks.map((block, index) => {
                if ('p' in block) {
                    return (
                        <p key={index}>
                            <RichText text={block.p} />
                        </p>
                    );
                }

                if ('list' in block) {
                    return (
                        <ul key={index}>
                            {block.list.map((item, position) => (
                                <li key={position}>
                                    <RichText text={item} />
                                </li>
                            ))}
                        </ul>
                    );
                }

                if ('note' in block) {
                    return (
                        <p key={index} className="policy-note">
                            <Info
                                aria-hidden="true"
                                className="mt-1 size-4 shrink-0"
                            />
                            <span>
                                <RichText text={block.note} />
                            </span>
                        </p>
                    );
                }

                if ('table' in block) {
                    return <PolicyTable key={index} {...block.table} />;
                }

                return block.items.map((item) => (
                    <ContentItem
                        key={item.id}
                        item={item}
                        highlighted={item.id === highlight}
                    />
                ));
            })}
        </>
    );
}

/**
 * Tabela que rola sozinha quando não cabe; no celular, cada linha vira um
 * bloco com o nome da coluna antes de cada valor.
 */
export function PolicyTable({
    caption,
    columns,
    rows,
}: {
    caption: string;
    columns: string[];
    rows: string[][];
}) {
    return (
        // Região rolável e focável, para quem usa teclado conseguir rolar.
        <div
            className="policy-table"
            role="region"
            aria-label={caption}
            tabIndex={0}
        >
            <table>
                <caption className="sr-only">{caption}</caption>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column} scope="col">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([first, ...rest], index) => (
                        <tr key={index}>
                            <th scope="row">{first}</th>
                            {rest.map((cell, position) => (
                                <td
                                    key={position}
                                    data-label={columns[position + 1]}
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ContentItem({
    item,
    highlighted,
}: {
    item: PolicyItem;
    highlighted: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div
            id={itemAnchor(item.id)}
            className={cn(
                'policy-item',
                highlighted && 'policy-item-highlighted',
            )}
        >
            <div className="mb-2 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-7 min-w-11 items-center justify-center rounded-full bg-surface-muted px-2.5 text-meta font-extrabold text-text-on-selected">
                    {item.id}
                </span>
                <h3 className="font-display text-[1.1875rem]/[1.625rem] font-extrabold">
                    {item.title}
                </h3>
                {highlighted && (
                    <span className="ml-auto text-caption font-extrabold text-primary-text">
                        {t('policies.item.here')}
                    </span>
                )}
            </div>
            <p className="mb-3 text-body">{item.text}</p>
            <dl className="grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-inner bg-tint-danger-bg/40 px-3 py-2.5 text-meta dark:bg-tint-danger-bg">
                    <dt className="text-caption font-extrabold">
                        {t('policies.item.bad')}
                    </dt>
                    <dd>{item.bad}</dd>
                </div>
                <div className="rounded-inner bg-tint-success-bg/40 px-3 py-2.5 text-meta dark:bg-tint-success-bg">
                    <dt className="text-caption font-extrabold">
                        {t('policies.item.good')}
                    </dt>
                    <dd>{item.good}</dd>
                </div>
            </dl>
        </div>
    );
}
