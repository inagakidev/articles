import iconDark from '../../images/logo/icon-dark.svg?url';
import iconLight from '../../images/logo/icon-light.svg?url';
import wordmarkDark from '../../images/logo/wordmark-dark.svg?url';
import wordmarkFullDark from '../../images/logo/wordmark-full-dark.svg?url';
import wordmarkFullLight from '../../images/logo/wordmark-full-light.svg?url';
import wordmarkLight from '../../images/logo/wordmark-light.svg?url';
import { cn } from '@/lib/utils';

/**
 * Variações da logo he4rt ink, geradas por design/logo/gerar.mjs.
 * "wordmark-full" tem a tagline "he4rt developers" e é usada no rodapé.
 */
const files = {
    icon: { light: iconLight, dark: iconDark },
    wordmark: { light: wordmarkLight, dark: wordmarkDark },
    'wordmark-full': { light: wordmarkFullLight, dark: wordmarkFullDark },
};

export type LogoVariant = keyof typeof files;

type Props = {
    variant: LogoVariant;
    /** Altura em pixels; a largura segue a proporção da arte. */
    height: number;
    className?: string;
};

/**
 * A arte é decorativa: quem usa a logo dá o nome do produto como texto
 * (por exemplo, oculto num link). As duas versões são trocadas pelo tema
 * só com CSS, para não piscar ao carregar.
 */
export default function Logo({ variant, height, className }: Props) {
    const { light, dark } = files[variant];
    const common = {
        alt: '',
        'aria-hidden': true,
        height,
        draggable: false,
        style: { height },
    } as const;

    return (
        <span className={cn('inline-flex shrink-0', className)}>
            <img
                {...common}
                src={light}
                className="block w-auto select-none dark:hidden"
            />
            <img
                {...common}
                src={dark}
                className="hidden w-auto select-none dark:block"
            />
        </span>
    );
}
