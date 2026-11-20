import { useEffect, useState } from 'react';

/**
 * Segundos que faltam a partir de `seconds`, atualizados a cada segundo até
 * zerar. Recomeça quando `seconds` ou `restartKey` mudam (por exemplo, a cada
 * nova resposta do servidor, mesmo que o número seja igual).
 */
export function useCountdown(
    seconds: number | null | undefined,
    restartKey?: unknown,
): number {
    const [left, setLeft] = useState(seconds ?? 0);

    useEffect(() => {
        const total = seconds ?? 0;
        const deadline = Date.now() + total * 1000;
        const remaining = () =>
            Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

        setLeft(total);

        if (total <= 0) {
            return;
        }

        const timer = setInterval(() => {
            const next = remaining();
            setLeft(next);

            if (next === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, restartKey]);

    return left;
}
