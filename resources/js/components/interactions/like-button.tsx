import { Link, router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
    requiresAuthentication = false,
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
    /** Abre as opções de acesso para visitantes que tentam curtir. */
    requiresAuthentication?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}) {
    const { t } = useTranslation();
    const [state, setState] = useState({ count, liked });
    const [bursts, setBursts] = useState<number[]>([]);
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const next = useRef(0);

    useEffect(() => setState({ count, liked }), [count, liked]);

    const sizes =
        size === 'sm'
            ? 'h-8 gap-1 rounded-full px-2 text-caption [&_svg]:size-4'
            : 'size-10 flex-col gap-0.5 rounded-full [&_svg]:size-5';

    if (!canLike || requiresAuthentication) {
        const content = (
            <>
                <Heart
                    aria-hidden="true"
                    className={size === 'sm' ? 'size-4' : 'size-5'}
                />
                <span
                    aria-hidden="true"
                    className={
                        size === 'sm'
                            ? 'text-caption leading-3'
                            : 'text-xs leading-3'
                    }
                >
                    {state.count}
                </span>
                <span className="sr-only">
                    {t(state.count === 1 ? 'likes.count_one' : 'likes.count', {
                        count: state.count,
                    })}
                </span>
            </>
        );
        const actionClass = cn(
            'inline-flex items-center justify-center gap-0.5 font-bold text-text-secondary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            sizes,
            className,
        );

        return (
            <>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {requiresAuthentication ? (
                                <button
                                    type="button"
                                    aria-label={t(
                                        state.count === 1
                                            ? 'likes.button_one'
                                            : 'likes.button',
                                        { label, count: state.count },
                                    )}
                                    onClick={() => setAuthDialogOpen(true)}
                                    className={actionClass}
                                >
                                    {content}
                                </button>
                            ) : (
                                <span
                                    tabIndex={0}
                                    title={ownHint}
                                    className={actionClass}
                                >
                                    {content}
                                </span>
                            )}
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            {ownHint ?? label}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                {requiresAuthentication && (
                    <Dialog
                        open={authDialogOpen}
                        onOpenChange={setAuthDialogOpen}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="font-display text-h3 font-extrabold">
                                    {t('likes.auth.title')}
                                </DialogTitle>
                                <DialogDescription>
                                    {t('likes.auth.description')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="md"
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={register()}>
                                        {t('account.login.create_account')}
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="md"
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={login()}>
                                        {t('account.login.submit')}
                                    </Link>
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </>
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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-pressed={state.liked}
                        aria-label={t(
                            state.count === 1
                                ? 'likes.button_one'
                                : 'likes.button',
                            {
                                label,
                                count: state.count,
                            },
                        )}
                        onClick={toggle}
                        className={cn(
                            'inline-flex items-center justify-center font-bold transition-colors outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-surface-selected',
                            sizes,
                            state.liked
                                ? 'bg-primary/10 text-primary-text'
                                : 'text-text-secondary hover:text-text-primary',
                            className,
                        )}
                    >
                        <span className="relative inline-flex">
                            {bursts.map((id) => (
                                <span
                                    key={id}
                                    aria-hidden="true"
                                    className="like-hearts"
                                >
                                    {HEARTS.map((heart, index) => (
                                        <i
                                            key={index}
                                            style={
                                                {
                                                    '--heart-x': `${heart.x}px`,
                                                    '--heart-y': `${heart.y}px`,
                                                    '--heart-scale':
                                                        heart.scale,
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
                                className={cn(
                                    size === 'sm' ? 'size-4' : 'size-5',
                                    state.liked && 'like-pop fill-current',
                                )}
                            />
                        </span>
                        <span
                            aria-hidden="true"
                            className={
                                size === 'sm'
                                    ? 'text-caption leading-3'
                                    : 'text-xs leading-3'
                            }
                        >
                            {state.count}
                        </span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
