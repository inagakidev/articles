import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { edit, store } from '@/routes/articles';
import { update as updateDraft } from '@/routes/articles/draft';

/** Campos do rascunho que o editor manda; só os que mudaram vão em cada envio. */
export type DraftFields = {
    title: string;
    content: unknown;
    language: string | null;
    category_id: number | null;
    tags: string[];
};

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'invalid';

/** Espera a pessoa parar de digitar antes de salvar. */
const DELAY_MS = 1200;

/** Em falha de rede ou servidor, tenta de novo depois disso. */
const RETRY_MS = 8000;

function xsrfToken(): string {
    const cookie = document.cookie
        .split('; ')
        .find((part) => part.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

/**
 * Salvamento automático do rascunho (RF-071). Junta as mudanças, espera a
 * pausa na digitação e manda só o que mudou. Um artigo novo é criado no
 * primeiro envio, e a URL passa a ser a de edição, sem recarregar.
 */
export function useAutosave({
    articleId: initialId,
    savedAt: initialSavedAt,
}: {
    articleId: number | null;
    savedAt: string | null;
}) {
    const [articleId, setArticleId] = useState(initialId);
    const [status, setStatus] = useState<SaveStatus>('idle');
    const [savedAt, setSavedAt] = useState(initialSavedAt);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const pending = useRef<Partial<DraftFields>>({});
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const saving = useRef(false);
    const idRef = useRef(initialId);

    const save = useCallback(async (): Promise<void> => {
        if (saving.current || Object.keys(pending.current).length === 0) {
            return;
        }

        const patch = pending.current;
        pending.current = {};
        saving.current = true;
        setStatus('saving');

        const id = idRef.current;
        const target = id === null ? store() : updateDraft(id);

        try {
            const response = await fetch(target.url, {
                method: target.method.toUpperCase(),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify(patch),
            });
            const body = (await response.json().catch(() => ({}))) as {
                articleId?: number;
                savedAt?: string;
                errors?: Record<string, string[]>;
            };

            if (response.status === 422) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(body.errors ?? {}).map(([key, list]) => [
                            key,
                            list[0],
                        ]),
                    ),
                );
                setStatus('invalid');

                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            setErrors({});
            setSavedAt(body.savedAt ?? new Date().toISOString());
            setStatus('saved');

            if (id === null && body.articleId) {
                idRef.current = body.articleId;
                setArticleId(body.articleId);
                router.replace({
                    url: edit(body.articleId).url,
                    props: (props) => ({ ...props, articleId: body.articleId }),
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        } catch {
            // Devolve o que não foi salvo e tenta de novo.
            pending.current = { ...patch, ...pending.current };
            setStatus('error');
            timer.current = setTimeout(() => void save(), RETRY_MS);
        } finally {
            saving.current = false;

            if (Object.keys(pending.current).length > 0) {
                timer.current = setTimeout(() => void save(), DELAY_MS);
            }
        }
    }, []);

    const change = useCallback(
        (fields: Partial<DraftFields>) => {
            pending.current = { ...pending.current, ...fields };

            if (timer.current) {
                clearTimeout(timer.current);
            }

            timer.current = setTimeout(() => void save(), DELAY_MS);
        },
        [save],
    );

    // Avisa antes de sair com algo ainda não salvo.
    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => {
            if (Object.keys(pending.current).length > 0 || saving.current) {
                event.preventDefault();
            }
        };

        window.addEventListener('beforeunload', warn);

        return () => {
            window.removeEventListener('beforeunload', warn);

            if (timer.current) {
                clearTimeout(timer.current);
            }
        };
    }, []);

    return { articleId, status, savedAt, errors, change, flush: save };
}
