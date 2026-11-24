import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import SearchField from '@/components/ui/search-field';
import { useTranslation } from '@/lib/i18n';
import { search } from '@/routes';

/**
 * A caixa "Buscar artigos" do cabeçalho e do 404: leva à página de busca
 * com o termo (RF-003).
 */
export default function SearchForm({
    id,
    initial = '',
    hints,
    size = 'md',
    className,
}: {
    id: string;
    initial?: string;
    hints?: string[];
    size?: 'md' | 'lg';
    className?: string;
}) {
    const { t } = useTranslation();
    const [q, setQ] = useState(initial);

    function submit(event: FormEvent) {
        event.preventDefault();
        router.get(search({ query: q.trim() ? { q: q.trim() } : {} }).url);
    }

    return (
        <form
            role="search"
            aria-label={t('search.form_label')}
            onSubmit={submit}
            className={className}
        >
            <SearchField
                id={id}
                label={t('search.label')}
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder={hints ? undefined : t('search.placeholder')}
                hints={hints}
                enterKeyHint="search"
                maxLength={100}
                className={
                    size === 'lg'
                        ? '[&_input]:h-12 [&_input]:text-body'
                        : undefined
                }
            />
        </form>
    );
}
