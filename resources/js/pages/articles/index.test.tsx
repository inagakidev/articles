import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import ArticlesIndex from '@/pages/articles/index';
import type { ArticleSummary } from '@/types';

const article = (number: number): ArticleSummary => ({
    url: `/artigos/artigo-${number}`,
    title: `Artigo ${number}`,
    excerpt: 'Resumo do artigo.',
    cover: null,
    category: { name: 'Back-end', color: 'blue' },
    author: { name: 'Lia Martins', avatar: null },
    publishedAt: '2026-11-12',
    readingMinutes: 9,
});

const categories = [
    { slug: 'back-end', name: 'Back-end', color: 'blue' as const },
    { slug: 'devops', name: 'DevOps', color: 'pink' as const },
];

const page = (data: ArticleSummary[], extra = {}) => ({
    data,
    currentPage: 1,
    lastPage: 1,
    total: data.length,
    from: data.length ? 1 : null,
    to: data.length || null,
    ...extra,
});

describe('listagem de artigos', () => {
    beforeEach(() => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: null },
        });
    });

    it('mostra os cartões, as categorias e quantos são', () => {
        render(
            <ArticlesIndex
                categories={categories}
                category={null}
                articles={page([article(1), article(2)], {
                    total: 14,
                    lastPage: 2,
                    to: 12,
                })}
            />,
        );

        expect(screen.getByRole('link', { name: 'Artigo 1' })).toHaveAttribute(
            'href',
            '/artigos/artigo-1',
        );
        expect(screen.getAllByText(/12 nov 2026/)).toHaveLength(2);
        const nav = screen.getByRole('navigation', { name: 'Categorias' });
        expect(
            within(nav).getByRole('link', { name: 'Todas' }),
        ).toHaveAttribute('aria-current', 'true');
        expect(
            within(nav).getByRole('link', { name: 'DevOps' }),
        ).toHaveAttribute('href', '/artigos?categoria=devops#artigos');
        expect(screen.getByRole('status')).toHaveTextContent(
            'Mostrando 1–12 de 14 artigos',
        );
        expect(
            screen.getByRole('navigation', { name: 'Paginação' }),
        ).toBeInTheDocument();
    });

    it('na categoria escolhida, o título e o filtro dizem qual é', () => {
        render(
            <ArticlesIndex
                categories={categories}
                category="devops"
                articles={page([article(1)])}
            />,
        );

        expect(
            screen.getByRole('heading', { name: 'Artigos de DevOps' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'DevOps' })).toHaveAttribute(
            'aria-current',
            'true',
        );
        expect(screen.getByRole('status')).toHaveTextContent(
            'Mostrando 1 artigo',
        );
    });

    it('sem artigos, convida a escrever', () => {
        render(
            <ArticlesIndex
                categories={[]}
                category={null}
                articles={page([])}
            />,
        );

        expect(
            screen.getByRole('heading', {
                name: 'Os primeiros artigos estão chegando',
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('navigation', { name: 'Categorias' }),
        ).toBeNull();
    });

    it('categoria sem artigos oferece voltar para todos', () => {
        render(
            <ArticlesIndex
                categories={categories}
                category="devops"
                articles={page([])}
            />,
        );

        expect(
            screen.getByText('Nenhum artigo de DevOps ainda'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Ver todos os artigos' }),
        ).toHaveAttribute('href', '/artigos#artigos');
    });
});
