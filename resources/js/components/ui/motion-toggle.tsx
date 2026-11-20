import { Pause, Play } from 'lucide-react';
import { useMotionPause } from '@/hooks/use-motion-pause';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Botão "Pausar animações" (RF-383). Aparece onde houver movimento contínuo
 * e pausa todas as animações contínuas do site.
 */
export default function MotionToggle({ className }: { className?: string }) {
    const { t } = useTranslation();
    const { paused, toggle } = useMotionPause();
    const Icon = paused ? Play : Pause;

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
            {paused ? t('motion.resume') : t('motion.pause')}
        </button>
    );
}
