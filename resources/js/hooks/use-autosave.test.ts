import { act, renderHook } from '@testing-library/react';
import { router } from '@inertiajs/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { useAutosave } from '@/hooks/use-autosave';

function reply(status: number, body: unknown) {
    return Promise.resolve(
        new Response(JSON.stringify(body), {
            status,
            headers: { 'Content-Type': 'application/json' },
        }),
    );
}

describe('salvamento automático do rascunho', () => {
    const fetchMock = vi.fn();
    const replace = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('fetch', fetchMock);
        vi.spyOn(router, 'replace').mockImplementation(replace);
        document.cookie = 'XSRF-TOKEN=abc%3D';
    });

    afterEach(() => {
        fetchMock.mockReset();
        replace.mockReset();
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('espera a pausa, cria o artigo no primeiro envio e passa a usar a URL de edição', async () => {
        fetchMock.mockReturnValueOnce(
            reply(201, { articleId: 7, savedAt: '2026-11-21T10:00:00Z' }),
        );
        const { result } = renderHook(() =>
            useAutosave({ articleId: null, savedAt: null }),
        );

        act(() => {
            result.current.change({ title: 'Fil' });
            result.current.change({ title: 'Filas' });
        });
        expect(fetchMock).not.toHaveBeenCalled();

        await act(() => vi.advanceTimersByTimeAsync(1200));

        expect(fetchMock).toHaveBeenCalledOnce();
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('/articles');
        expect(init.method).toBe('POST');
        expect(JSON.parse(init.body)).toEqual({ title: 'Filas' });
        expect(init.headers['X-XSRF-TOKEN']).toBe('abc=');
        expect(result.current.status).toBe('saved');
        expect(result.current.articleId).toBe(7);
        expect(replace).toHaveBeenCalledWith(
            expect.objectContaining({ url: '/articles/7/edit' }),
        );

        fetchMock.mockReturnValueOnce(
            reply(200, { savedAt: '2026-11-21T10:01:00Z' }),
        );
        act(() => result.current.change({ tags: ['php'] }));
        await act(() => vi.advanceTimersByTimeAsync(1200));

        expect(fetchMock.mock.calls[1][0]).toBe('/articles/7/draft');
        expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
        expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
            tags: ['php'],
        });
    });

    it('mostra o primeiro erro de cada campo quando o servidor recusa', async () => {
        fetchMock.mockReturnValueOnce(
            reply(422, { errors: { title: ['Longo demais.', 'outro'] } }),
        );
        const { result } = renderHook(() =>
            useAutosave({ articleId: 3, savedAt: null }),
        );

        act(() => result.current.change({ title: 'x'.repeat(151) }));
        await act(() => vi.advanceTimersByTimeAsync(1200));

        expect(result.current.status).toBe('invalid');
        expect(result.current.errors).toEqual({ title: 'Longo demais.' });
    });

    it('em falha de rede guarda o que não foi salvo e tenta de novo', async () => {
        fetchMock
            .mockRejectedValueOnce(new TypeError('offline'))
            .mockReturnValueOnce(reply(200, { savedAt: 'agora' }));
        const { result } = renderHook(() =>
            useAutosave({ articleId: 3, savedAt: null }),
        );

        act(() => result.current.change({ title: 'Filas' }));
        await act(() => vi.advanceTimersByTimeAsync(1200));
        expect(result.current.status).toBe('error');

        await act(() => vi.advanceTimersByTimeAsync(8000));

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
            title: 'Filas',
        });
        expect(result.current.status).toBe('saved');
    });
});
