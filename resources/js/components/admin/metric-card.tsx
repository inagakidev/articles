import type { LucideIcon } from 'lucide-react';
import CountUp from '@/components/ui/count-up';

/** Um número do painel: o que é, o valor e o que ele inclui. */
export default function MetricCard({
    Icon,
    title,
    value,
    hint,
}: {
    Icon: LucideIcon;
    title: string;
    value: number;
    hint: string;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-[18px] border border-border bg-surface px-5 py-4.5">
            <dt className="inline-flex items-center gap-2 text-meta font-bold text-text-secondary">
                <Icon aria-hidden="true" className="size-4" />
                {title}
            </dt>
            <dd className="font-display text-[1.875rem]/9 font-extrabold">
                <CountUp value={value} />
            </dd>
            <dd className="text-caption text-text-secondary">{hint}</dd>
        </div>
    );
}
