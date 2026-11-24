import { router } from '@inertiajs/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import '@/test/inertia';
import Favorites from '@/pages/favorites/index';

const summary = (title: string) => ({
    url: `/artigos/${title.toLowerCase().replaceAll(' ', '-')}`,
    title,
    excerpt: 'Resumo.',
    cover: null,
    category: { name: 'Back-end', color: 'blue' as const },
    author: { name: 'Rafa Moreira', avatar: null },
    publishedAt: '2026-11-12',
    readingMinutes: 9,
});

const page = (data: unknown[], total = data.length) => ({
    data: data as never,
    currentPage: 1,
    lastPage: 1,
    total,
});

describe('favoritos', () => {
    afterEach(() => vi.restoreAllMocks());

    it('mostra os salvos, o indisponível e a contagem, só para quem salvou', () => {
        render(
            <Favorites
                sort="salvos"
                favorites={page([
                    {
                        articleId: 1,
                        savedAt: '2026-11-20T10:00:00Z',
                        article: summary('Filas no Laravel'),
                    },
                    {
                        articleId: 2,
                        savedAt: '2026-11-19T10:00:00Z',
                        article: null,
                    },
                ])}
            />,
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'Favoritos' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Só você vê esta lista.')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Filas no Laravel' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Remover dos favoritos: Filas no Laravel',
            }),
        ).toHaveAttribute('aria-pressed', 'true');
        expect(
            screen.getByText('Este artigo não está mais disponível'),
        ).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent(
            '2 artigos salvos',
        );
    });

    it('remover tira da lista; o indisponível sai pelo botão do aviso', () => {
        const remove = vi.spyOn(router, 'delete').mockImplementation(() => {});
        render(
            <Favorites
                sort="salvos"
                favorites={page([
                    {
                        articleId: 1,
                        savedAt: '2026-11-20T10:00:00Z',
                        article: summary('Filas no Laravel'),
                    },
                    {
                        articleId: 2,
                        savedAt: '2026-11-19T10:00:00Z',
                        article: null,
                    },
                ])}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Remover dos favoritos: Filas no Laravel',
            }),
        );
        fireEvent.click(
            screen.getByRole('button', { name: 'Remover da lista' }),
        );

        expect(remove).toHaveBeenNthCalledWith(
            1,
            '/articles/1/favorite',
            expect.objectContaining({ preserveScroll: true }),
        );
        expect(remove).toHaveBeenNthCalledWith(
            2,
            '/articles/2/favorite',
            expect.anything(),
        );
    });

    it('trocar a ordem leva ao endereço com a ordem escolhida', () => {
        const get = vi.spyOn(router, 'get').mockImplementation(() => {});
        render(
            <Favorites
                sort="salvos"
                favorites={page([
                    {
                        articleId: 1,
                        savedAt: '2026-11-20T10:00:00Z',
                        article: summary('Filas no Laravel'),
                    },
                ])}
            />,
        );

        fireEvent.change(screen.getByLabelText('Ordenar por'), {
            target: { value: 'publicados' },
        });

        expect(get).toHaveBeenCalledWith(
            '/favoritos?ordem=publicados',
            {},
            expect.objectContaining({ replace: true }),
        );
        expect(screen.getByRole('status')).toHaveTextContent('1 artigo salvo');
    });

    it('lista vazia convida a explorar, sem ordenação', () => {
        render(<Favorites sort="salvos" favorites={page([])} />);

        expect(screen.getByText('Nada salvo ainda')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Explorar artigos' }),
        ).toHaveAttribute('href', '/artigos');
        expect(screen.queryByLabelText('Ordenar por')).not.toBeInTheDocument();
    });
});
