import { router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Corações de cada rajada ao curtir: deslocamento lateral, altura, atraso e
 * tamanho de cada um. Cada clique solta uma rajada nova, e as anteriores
 * seguem subindo até sumir.
 */
const HEARTS = [
    { x: -18, y: -46, delay: 0, scale: 0.9 },
    { x: 14, y: -54, delay: 60, scale: 0.7 },
    { x: -6, y: -64, delay: 120, scale: 1 },
    { x: 22, y: -40, delay: 180, scale: 0.6 },
    { x: -24, y: -58, delay: 240, scale: 0.75 },
    { x: 6, y: -72, delay: 300, scale: 0.85 },
    { x: -12, y: -36, delay: 360, scale: 0.55 },
    { x: 18, y: -66, delay: 420, scale: 0.65 },
];

/** Duração de uma rajada, igual à animação `like-heart` mais o último atraso. */
const BURST_MS = 1300;

/**
 * Curtir (RF-148 a RF-156): só o coração e a contagem pública. Muda na hora
 * e confirma com o servidor; se falhar, volta. Quem não pode curtir
 * (visita, conta sem confirmar, o próprio conteúdo) vê só a contagem, sem
 * convite (RF-141).
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
    /** "Curtir", "Curtir comentário": o nome do botão, que não aparece. */
    label: string;
    /** Dica para quem vê a contagem do próprio conteúdo. */
    ownHint?: string;
    size?: 'sm' | 'md';
    className?: string;
}) {
    const { t } = useTranslation();
    const [state, setState] = useState({ count, liked });
    const [bursts, setBursts] = useState<number[]>([]);
    const next = useRef(0);

    useEffect(() => setState({ count, liked }), [count, liked]);

    const sizes =
        size === 'sm'
            ? 'h-8 gap-1 rounded-full px-2 text-caption [&_svg]:size-4'
            : 'h-10 gap-1.5 rounded-full px-2.5 text-meta [&_svg]:size-5';

    if (!canLike) {
        return (
            <span
                title={ownHint}
                className={cn(
                    'inline-flex items-center font-bold text-text-secondary',
                    sizes,
                    className,
                )}
            >
                <Heart aria-hidden="true" />
                <span aria-hidden="true">{state.count}</span>
                <span className="sr-only">
                    {t(state.count === 1 ? 'likes.count_one' : 'likes.count', {
                        count: state.count,
                    })}
                </span>
            </span>
        );
    }

    function toggle() {
        const liking = !state.liked;
        const previous = state;
        setState({ liked: liking, count: state.count + (liking ? 1 : -1) });

        if (liking) {
            const id = ++next.current;
            setBursts((current) => [...current, id]);
            window.setTimeout(
                () =>
                    setBursts((current) =>
                        current.filter((burst) => burst !== id),
                    ),
                BURST_MS,
            );
        }

        const options = {
            preserveScroll: true,
            preserveState: true,
            only: reload,
            onError: () => setState(previous),
        };

        if (liking) {
            router.post(url, {}, options);
        } else {
            router.delete(url, options);
        }
    }

    return (
        <button
            type="button"
            aria-pressed={state.liked}
            aria-label={t(
                state.count === 1 ? 'likes.button_one' : 'likes.button',
                {
                    label,
                    count: state.count,
                },
            )}
            title={label}
            onClick={toggle}
            className={cn(
                'inline-flex items-center font-bold transition-colors hover:bg-surface-hover',
                sizes,
                state.liked
                    ? 'text-primary-text'
                    : 'text-text-secondary hover:text-text-primary',
                className,
            )}
        >
            <span className="relative inline-flex">
                {bursts.map((id) => (
                    <span key={id} aria-hidden="true" className="like-hearts">
                        {HEARTS.map((heart, index) => (
                            <i
                                key={index}
                                style={
                                    {
                                        '--heart-x': `${heart.x}px`,
                                        '--heart-y': `${heart.y}px`,
                                        '--heart-scale': heart.scale,
                                        animationDelay: `${heart.delay}ms`,
                                    } as CSSProperties
                                }
                            >
                                <Heart className="fill-current" />
                            </i>
                        ))}
                    </span>
                ))}
                <Heart
                    aria-hidden="true"
                    className={cn(state.liked && 'like-pop fill-current')}
                />
            </span>
            <span aria-hidden="true">{state.count}</span>
        </button>
    );
}
