import { cn } from '@/lib/utils';

/**
 * Ilustrações do mascote (resources/images/mascote), pelo nome do arquivo.
 * São geradas por design/mascote/converter.py; onde cada uma é usada está em
 * docs/DESIGN.md §5.3.
 */
export const mascotArts = [
    'apresentando',
    'rosto',
    'lendo',
    'pensativo',
    'comemorando',
    'escrevendo',
    'esperando',
    'procurando',
    'dormindo',
    'ajustando',
] as const;

export type MascotArt = (typeof mascotArts)[number];

const files = import.meta.glob<string>('../../../images/mascote/*.webp', {
    eager: true,
    query: '?url',
    import: 'default',
});

export const mascotUrls: Record<string, string> = Object.fromEntries(
    Object.entries(files).map(([path, url]) => [
        path.split('/').pop()!.replace('.webp', ''),
        url,
    ]),
);

/** Abaixo disso o corpo inteiro perde os detalhes (design/mascote). */
const FULL_BODY = 96;

type Props = {
    art: MascotArt;
    /** Largura em pixels. */
    size: number;
    /** Flutua devagar, sem parar (pausa com "Pausar animações"). */
    float?: boolean;
    /**
     * Sombra no chão, para o mascote parecer apoiado em vez de solto. Com
     * `float`, a sombra encolhe quando ele sobe.
     */
    grounded?: boolean;
    className?: string;
};

/**
 * O mascote é sempre decorativo: o texto ao lado comunica a mensagem.
 * Abaixo de 96 px usa só o rosto.
 */
export default function Mascot({
    art,
    size,
    float = false,
    grounded = false,
    className,
}: Props) {
    const name = size < FULL_BODY ? 'rosto' : art;
    const image = (
        <img
            src={mascotUrls[name]}
            alt=""
            aria-hidden="true"
            width={size}
            className={cn(
                'block h-auto shrink-0 select-none',
                float && 'animate-float',
                grounded ? 'relative w-full' : className,
            )}
            style={grounded ? undefined : { width: size }}
            draggable={false}
        />
    );

    if (!grounded) {
        return image;
    }

    return (
        <span
            aria-hidden="true"
            className={cn('inline-flex shrink-0 flex-col items-center', className)}
            style={{ width: size }}
        >
            {image}
            <span
                className={cn('mascot-shadow', float && 'mascot-shadow-float')}
                style={{
                    height: Math.max(10, Math.round(size * 0.12)),
                    marginTop: -Math.round(size * 0.07),
                }}
            />
        </span>
    );
}
