import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type Item = {
    key: string;
    href: string;
    label: string;
};

/**
 * Abas em pílula que trocam a página (filtros por status). Diferente do
 * `SegmentedControl`, que escolhe um valor num formulário: aqui cada aba é
 * um link, e a atual é marcada com `aria-current`.
 */
export default function SegmentedNav({
    label,
    items,
    current,
    preserveScroll = false,
    className,
}: {
    /** Nome da navegação para leitores de tela. */
    label: string;
    items: Item[];
    /** A chave da aba atual. */
    current: string;
    preserveScroll?: boolean;
    className?: string;
}) {
    return (
        <nav aria-label={label} className={cn('inline-flex flex-wrap gap-1 self-start rounded-full bg-surface-muted p-1', className)}>
            {items.map((item) => (
                <Link
                    key={item.key}
                    href={item.href}
                    preserveScroll={preserveScroll}
                    aria-current={current === item.key ? 'page' : undefined}
                    className={cn(
                        'inline-flex h-9 items-center rounded-full px-4 text-meta font-bold',
                        current === item.key ? 'bg-surface shadow-sm' : 'text-text-secondary hover:text-text-primary',
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
