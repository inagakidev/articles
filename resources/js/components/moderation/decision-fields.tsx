import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import FormField from '@/components/ui/form-field';
import Textarea from '@/components/ui/textarea';
import { useTranslation } from '@/lib/i18n';
import { content } from '@/routes/policies';

export type PolicyItem = { id: string; title: string };

/**
 * Item da Política de conteúdo e justificativa (RF-107, RF-111, RF-122),
 * nos campos `policy_item` e `reason`. O link leva ao item escolhido.
 */
export default function DecisionFields({
    idPrefix,
    items,
    errors,
    reasonHint,
    withItem = true,
}: {
    idPrefix: string;
    items: PolicyItem[];
    errors: Partial<Record<'policy_item' | 'reason', string>>;
    /** Quem vai ler a justificativa e o que acontece depois. */
    reasonHint: string;
    /** Sem o item da Política (decisão improcedente, RF-173). */
    withItem?: boolean;
}) {
    const { t } = useTranslation();
    const [item, setItem] = useState('');

    return (
        <>
            {withItem && (
                <FormField
                    id={`${idPrefix}-item`}
                    label={t('moderation.fields.policy_item')}
                    error={errors.policy_item}
                    hint={
                        item ? (
                            <Link
                                href={content({ query: { item } })}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 font-bold text-primary-text hover:underline"
                            >
                                <BookOpen
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                {t('moderation.read_item', { item })}
                            </Link>
                        ) : undefined
                    }
                >
                    {(field) => (
                        <select
                            {...field}
                            name="policy_item"
                            value={item}
                            onChange={(event) => setItem(event.target.value)}
                            className="h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] text-text-primary focus-visible:outline-offset-[-1px]"
                        >
                            <option value="">
                                {t('moderation.fields.policy_item_placeholder')}
                            </option>
                            {items.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.id} · {option.title}
                                </option>
                            ))}
                        </select>
                    )}
                </FormField>
            )}
            <FormField
                id={`${idPrefix}-reason`}
                label={t('moderation.fields.reason')}
                error={errors.reason}
                hint={reasonHint}
            >
                {(field) => (
                    <Textarea
                        {...field}
                        name="reason"
                        rows={4}
                        maxLength={2000}
                        className="focus-visible:outline-offset-[-1px]"
                    />
                )}
            </FormField>
        </>
    );
}
