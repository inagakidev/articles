import { router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Partículas do "estouro" ao curtir (DESIGN §7, LikeButton). */
const PARTICLES = 6;

/**
 * Curtir (RF-148 a RF-156): o coração e a contagem pública. Muda na hora e
 * confirma com o servidor; se falhar, volta. Quem não pode curtir (visita,
 * conta sem confirmar, o próprio conteúdo) vê só a contagem, sem convite
 * (RF-141).
 */
export default function LikeButton({
    count,
    liked,
    canLike,
    url,
    reload,
    label,
    ownHint,
    size = 'md',
    className,
}: {
    count: number;
    liked: boolean;
    canLike: boolean;
    /** Endereço da curtida (POST curte, DELETE descurte). */
    url: string;
    /** As props que a página recarrega depois (`likes`, `comments`). */
    reload: string[];
    /** "Curtir", "Curtir comentário". */
    label: string;
    /** Dica para quem vê a contagem do próprio conteúdo. */
    ownHint?: string;
    size?: 'sm' | 'md';
    className?: string;
}) {
    const { t } = useTranslation();
    const [state, setState] = useState({ count, liked });
    const [burst, setBurst] = useState(0);

    useEffect(() => setState({ count, liked }), [count, liked]);

    const sizes =
        size === 'sm'
            ? 'h-8 gap-1.5 rounded-[10px] px-2.5 text-caption'
            : 'h-11 gap-2 rounded-xl px-4.5 text-[0.9375rem]';

    if (!canLike) {
        return (
            <span
                title={ownHint}
                aria-label={t('likes.count', { count: state.count })}
                className={cn(
                    'inline-flex items-center font-bold text-text-secondary',
                    sizes,
                    className,
                )}
            >
                <Heart aria-hidden="true" className="size-4" />
                {state.count}
            </span>
        );
    }

    function toggle() {
        const next = !state.liked;
        const previous = state;
        setState({ liked: next, count: state.count + (next ? 1 : -1) });

        if (next) {
            setBurst((value) => value + 1);
        }

        const options = {
            preserveScroll: true,
            preserveState: true,
            only: reload,
            onError: () => setState(previous),
        };

        if (next) {
            router.post(url, {}, options);
        } else {
            router.delete(url, options);
        }
    }

    return (
        <button
            type="button"
            aria-pressed={state.liked}
            aria-label={t('likes.button', { label, count: state.count })}
            onClick={toggle}
            className={cn(
                'relative inline-flex items-center font-bold transition-colors',
                sizes,
                state.liked
                    ? 'bg-surface-selected text-text-on-selected'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                className,
            )}
        >
            {burst > 0 && state.liked && (
                <span key={burst} aria-hidden="true" className="like-burst">
                    {Array.from({ length: PARTICLES }, (_, index) => (
                        <i key={index} />
                    ))}
                </span>
            )}
            <Heart
                aria-hidden="true"
                className={cn('size-4', state.liked && 'fill-current')}
            />
            <span aria-hidden="true">
                {size === 'md' && `${label} · `}
                {state.count}
            </span>
        </button>
    );
}
