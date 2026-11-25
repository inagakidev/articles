import { router } from '@inertiajs/react';
import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import * as favorites from '@/routes/favorites';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Favoritar na leitura (RF-159 a RF-161). Muda na hora e confirma com o
 * servidor; se falhar, volta. Quem não pode favoritar vê o marcador sem
 * contagem (RF-141).
 */
export default function FavoriteButton({
    articleId,
    favorited,
    canFavorite,
}: {
    articleId: number;
    favorited: boolean;
    canFavorite: boolean;
}) {
    const { t } = useTranslation();
    const [state, setState] = useState(favorited);

    useEffect(() => setState(favorited), [favorited]);

    const base =
        'inline-flex size-10 items-center justify-center rounded-full font-bold outline-none transition-colors hover:bg-surface-hover active:bg-surface-selected focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-5';

    if (!canFavorite) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span
                            tabIndex={0}
                            aria-label={t('favorites.save')}
                            className={cn(base, 'text-text-secondary')}
                        >
                            <Bookmark aria-hidden="true" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        {t('favorites.save')}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    function toggle() {
        const next = !state;
        const previous = state;
        setState(next);

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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-pressed={state}
                        aria-label={label}
                        onClick={toggle}
                        className={cn(
                            base,
                            state
                                ? 'bg-primary/10 text-primary-text'
                                : 'text-text-secondary hover:text-text-primary',
                        )}
                    >
                        <Bookmark
                            aria-hidden="true"
                            className={cn(
                                'size-5',
                                state && 'like-pop fill-current',
                            )}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
