import type { CSSProperties } from 'react';
import { useTranslation } from '@/lib/i18n';

/** Acima disso o contador perderia o separador de milhar; mostra direto. */
const ANIMATED_MAX = 999;

/**
 * Número que conta de 0 até o valor ao aparecer (efeito em css/app/effects.css). O
 * leitor de tela lê só o valor final, já formatado no idioma da página.
 */
export default function CountUp({ value }: { value: number }) {
    const { locale } = useTranslation();
    const formatted = new Intl.NumberFormat(locale.replace('_', '-')).format(
        value,
    );

    if (value > ANIMATED_MAX) {
        return <>{formatted}</>;
    }

    return (
        <>
            <span className="sr-only">{formatted}</span>
            <span
                aria-hidden="true"
                className="count-up"
                style={{ '--count-to': value } as CSSProperties}
            />
        </>
    );
}
