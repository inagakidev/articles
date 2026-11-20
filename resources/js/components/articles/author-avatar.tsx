import { pastelTones, toneAt } from '@/components/ui/pill';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { AuthorSummary } from '@/types';

/**
 * Foto de quem escreveu ou, sem foto, as iniciais num pastel. É decorativa:
 * o nome sempre aparece em texto ao lado.
 */
export default function AuthorAvatar({
    author,
    index = 0,
    className,
}: {
    author: AuthorSummary;
    /** Posição na lista, para variar o pastel de quem não tem foto. */
    index?: number;
    className?: string;
}) {
    const getInitials = useInitials();

    if (author.avatar) {
        return (
            <img
                src={author.avatar}
                alt=""
                aria-hidden="true"
                className={cn('shrink-0 object-cover', className)}
            />
        );
    }

    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex shrink-0 items-center justify-center font-extrabold',
                pastelTones[toneAt(index)],
                className,
            )}
        >
            {getInitials(author.name)}
        </span>
    );
}
