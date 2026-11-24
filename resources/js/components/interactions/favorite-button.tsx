import { router } from '@inertiajs/react';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as favorites from '@/routes/favorites';

/**
 * Favoritar na leitura (RF-159 a RF-161): o marcador e a contagem pública.
 * Muda na hora e confirma com o servidor; se falhar, volta. Quem não pode
 * favoritar vê só a contagem, sem convite (RF-141).
 */
export default function FavoriteButton({
    articleId,
    count,
    favorited,
    canFavorite,
}: {
    articleId: number;
    count: number;
    favorited: boolean;
    canFavorite: boolean;
}) {
    const { t } = useTranslation();
    const [state, setState] = useState({ count, favorited });

    useEffect(() => setState({ count, favorited }), [count, favorited]);

    const base =
        'inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-meta font-bold [&_svg]:size-5';

    if (!canFavorite) {
        return (
            <span className={cn(base, 'text-text-secondary')}>
                <Bookmark aria-hidden="true" />
                <span aria-hidden="true">{state.count}</span>
                <span className="sr-only">
                    {t(
                        state.count === 1
                            ? 'favorites.count_one'
                            : 'favorites.count',
                        {
                            count: state.count,
                        },
                    )}
                </span>
            </span>
        );
    }

    function toggle() {
        const next = !state.favorited;
        const previous = state;
        setState({ favorited: next, count: state.count + (next ? 1 : -1) });

        const options = {
            preserveScroll: true,
            preserveState: true,
            only: ['favorites'],
            onError: () => setState(previous),
        };

        if (next) {
            router.post(favorites.store(articleId).url, {}, options);
        } else {
            router.delete(favorites.destroy(articleId).url, options);
        }
    }

    const label = t('favorites.save');

    return (
        <button
            type="button"
            aria-pressed={state.favorited}
            aria-label={t(
                state.count === 1 ? 'favorites.button_one' : 'favorites.button',
                {
                    label,
                    count: state.count,
                },
            )}
            title={label}
            onClick={toggle}
            className={cn(
                base,
                'transition-colors hover:bg-surface-hover',
                state.favorited
                    ? 'text-primary-text'
                    : 'text-text-secondary hover:text-text-primary',
            )}
        >
            <Bookmark
                aria-hidden="true"
                className={cn(state.favorited && 'like-pop fill-current')}
            />
            <span aria-hidden="true">{state.count}</span>
        </button>
    );
}
