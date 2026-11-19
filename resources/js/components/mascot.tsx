import { cn } from '@/lib/utils';

/**
 * Artes do kit do mascote (resources/images/mascote), pelo nome do arquivo.
 * Onde cada uma é usada está em docs/DESIGN.md §5.3.
 */
export const mascotArts = [
    'mascote-principal',
    'mascote-avatar',
    'pose-acenando',
    'pose-caminhando',
    'pose-comemorando',
    'pose-dormindo',
    'pose-escrevendo',
    'pose-lendo',
    'pose-lupa',
    'pose-pensando',
    'pose-segurando-folha',
    'pose-sentado-lendo',
    'expressao-cansado',
    'expressao-concentrado',
    'expressao-confuso',
    'expressao-curioso',
    'expressao-feliz',
    'expressao-muito-feliz',
    'expressao-orgulhoso',
    'expressao-pensativo',
    'expressao-surpreso',
    'expressao-triste',
] as const;

export type MascotArt = (typeof mascotArts)[number];

const files = import.meta.glob<string>('../../images/mascote/**/*.svg', {
    eager: true,
    query: '?url',
    import: 'default',
});

export const mascotUrls: Record<string, string> = Object.fromEntries(
    Object.entries(files).map(([path, url]) => [
        path.split('/').pop()!.replace('.svg', ''),
        url,
    ]),
);

/** Tamanhos mínimos do guia de identidade (design/mascote). */
const FULL_BODY = 96;
const AVATAR_MIN = 24;

type Props = {
    art: MascotArt;
    /** Largura em pixels. */
    size: number;
    className?: string;
};

/**
 * O mascote é sempre decorativo: o texto ao lado comunica a mensagem.
 * Abaixo de 96 px usa o avatar; abaixo de 24 px, só o marcador.
 */
export default function Mascot({ art, size, className }: Props) {
    if (size < AVATAR_MIN) {
        return <Bookmark size={size} className={className} />;
    }

    const name = size < FULL_BODY ? 'mascote-avatar' : art;

    return (
        <img
            src={mascotUrls[name]}
            alt=""
            aria-hidden="true"
            width={size}
            className={cn('block h-auto shrink-0 select-none', className)}
            style={{ width: size }}
            draggable={false}
        />
    );
}

/** O marcador roxo do topo do mascote, para ícones menores que 24 px. */
export function Bookmark({
    size,
    className,
}: {
    size: number;
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            className={cn('block shrink-0', className)}
        >
            <path
                d="M6 2.5h12a1 1 0 0 1 1 1v18l-7-4.5-7 4.5v-18a1 1 0 0 1 1-1z"
                fill="#875CCB"
                stroke="#56377F"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
