import { Pause, Play } from 'lucide-react';
import { useMotionPause } from '@/hooks/use-motion-pause';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Botão "Pausar animações" (RF-383). Aparece onde houver movimento contínuo
 * e pausa todas as animações contínuas do site. A variante "icon" é a do
 * cabeçalho da página de apresentação: só o ícone, com o nome acessível.
 */
export default function MotionToggle({
    variant = 'text',
    className,
}: {
    variant?: 'text' | 'icon';
    className?: string;
}) {
    const { t } = useTranslation();
    const { paused, toggle } = useMotionPause();
    const Icon = paused ? Play : Pause;
    const label = paused ? t('motion.resume') : t('motion.pause');

    if (variant === 'icon') {
        return (
            <button
                type="button"
                onClick={toggle}
                aria-label={label}
                title={label}
                className={cn(
                    'inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text-primary hover:bg-surface-hover',
                    className,
                )}
            >
                <Icon aria-hidden="true" className="size-[18px]" />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-meta font-bold text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                className,
            )}
        >
            <Icon aria-hidden="true" className="size-4" />
            {label}
        </button>
    );
}
