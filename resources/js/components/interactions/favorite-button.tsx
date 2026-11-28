import { router } from '@inertiajs/react';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import ActionTip from '@/components/interactions/action-tip';
import SignInPrompt from '@/components/interactions/sign-in-prompt';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as favorites from '@/routes/favorites';

/**
 * Favoritar na leitura (RF-159 a RF-161): o marcador e a contagem pública.
 * Muda na hora e confirma com o servidor; se falhar, volta. Quem visita é
 * convidada a entrar (D94); quem tem conta sem confirmar vê só a contagem.
 */
export default function FavoriteButton({
    articleId,
    count,
    favorited,
    canFavorite,
    guest = false,
}: {
    articleId: number;
    count: number;
    favorited: boolean;
    canFavorite: boolean;
    /** Sem conta: o clique abre o convite para entrar. */
    guest?: boolean;
}) {
    const { t } = useTranslation();
    const [state, setState] = useState({ count, favorited });
    const [prompt, setPrompt] = useState(false);

    useEffect(() => setState({ count, favorited }), [count, favorited]);

    const base =
        'inline-flex size-10 flex-col items-center justify-center gap-0.5 rounded-full text-xs leading-3 font-bold [&_svg]:size-5';
    const interactive =
        'outline-none transition-colors hover:bg-surface-hover active:bg-surface-selected focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    const label = t('favorites.save');
    const buttonLabel = t(
        state.count === 1 ? 'favorites.button_one' : 'favorites.button',
        { label, count: state.count },
    );
    const countText = <span aria-hidden="true">{state.count}</span>;

    if (guest) {
        return (
            <>
                <ActionTip label={label}>
                    <button
                        type="button"
                        aria-label={buttonLabel}
                        aria-haspopup="dialog"
                        onClick={() => setPrompt(true)}
                        className={cn(
                            base,
                            interactive,
                            'text-text-secondary hover:text-text-primary',
                        )}
                    >
                        <Bookmark aria-hidden="true" className="size-5" />
                        {countText}
                    </button>
                </ActionTip>
                <SignInPrompt
                    action="favorite"
                    open={prompt}
                    onClose={() => setPrompt(false)}
                />
            </>
        );
    }

    if (!canFavorite) {
        return (
            <span className={cn(base, 'text-text-secondary')}>
                <Bookmark aria-hidden="true" className="size-5" />
                {countText}
                <span className="sr-only">
                    {t(
                        state.count === 1
                            ? 'favorites.count_one'
                            : 'favorites.count',
                        { count: state.count },
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

    return (
        <ActionTip label={label}>
            <button
                type="button"
                aria-pressed={state.favorited}
                aria-label={buttonLabel}
                onClick={toggle}
                className={cn(
                    base,
                    interactive,
                    state.favorited
                        ? 'bg-primary/10 text-primary-text'
                        : 'text-text-secondary hover:text-text-primary',
                )}
            >
                <Bookmark
                    aria-hidden="true"
                    className={cn(state.favorited && 'like-pop fill-current')}
                />
                {countText}
            </button>
        </ActionTip>
    );
}
