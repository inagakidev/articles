import { useEffect, useState } from 'react';
import { availability } from '@/routes/username';

export type UsernameCheck =
    | { status: 'idle' }
    | { status: 'checking' }
    | { status: 'available'; username: string }
    | { status: 'unavailable'; message: string };

/** Espera a pessoa parar de digitar antes de consultar o servidor. */
const DEBOUNCE_MS = 350;

/**
 * Consulta se o username está livre enquanto a pessoa digita (RF-029). É só
 * um retorno rápido: o cadastro valida de novo no servidor.
 */
export function useUsernameAvailability(username: string): UsernameCheck {
    const [check, setCheck] = useState<UsernameCheck>({ status: 'idle' });

    useEffect(() => {
        const value = username.trim();

        if (value === '') {
            setCheck({ status: 'idle' });

            return;
        }

        setCheck({ status: 'checking' });
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    availability({ query: { username: value } }).url,
                    {
                        headers: { Accept: 'application/json' },
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    // Limite de consultas ou erro: o cadastro decide no envio.
                    setCheck({ status: 'idle' });

                    return;
                }

                const result = (await response.json()) as {
                    username: string;
                    available: boolean;
                    message: string | null;
                };

                setCheck(
                    result.available
                        ? { status: 'available', username: result.username }
                        : {
                              status: 'unavailable',
                              message: result.message ?? '',
                          },
                );
            } catch {
                // Consulta cancelada por uma digitação mais nova.
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [username]);

    return check;
}
