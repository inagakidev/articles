import { pastelTones } from '@/components/ui/pill';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { PastelTone } from '@/types';

const tones = Object.keys(pastelTones) as PastelTone[];

/**
 * Pastel estável para quem não tem foto (DESIGN §6.2): sai do nome, então a
 * mesma pessoa tem a mesma cor em todas as páginas.
 */
export function toneFor(name: string): PastelTone {
    let hash = 0;

    for (const char of name) {
        hash = (hash * 31 + char.codePointAt(0)!) >>> 0;
    }

    return tones[hash % tones.length];
}

/**
 * Foto de perfil em círculo (D76) ou, sem foto, as iniciais num pastel
 * (RF-033). É decorativa: o nome sempre aparece em texto por perto.
 */
export default function UserAvatar({
    name,
    avatar,
    className,
}: {
    name: string;
    avatar?: string | null;
    /** Tamanho e texto (`size-9 text-caption`). */
    className?: string;
}) {
    const getInitials = useInitials();

    if (avatar) {
        return (
            <img
                src={avatar}
                alt=""
                aria-hidden="true"
                className={cn('shrink-0 rounded-full object-cover', className)}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full font-display font-extrabold',
                pastelTones[toneFor(name)],
                className,
            )}
        >
            {getInitials(name)}
        </span>
    );
}
