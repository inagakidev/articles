import { router } from '@inertiajs/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import SearchPage from '@/pages/search/index';
import type { SearchQuery } from '@/components/search/search-filters';
import type { ArticleSummary } from '@/types';

const article = (number: number): ArticleSummary => ({
    url: `/artigos/artigo-${number}`,
    title: `Artigo ${number}`,
    excerpt: 'Resumo.',
    cover: null,
    category: { name: 'Back-end', color: 'blue' },
    author: { name: 'Lia Martins', avatar: null },
    publishedAt: '2026-11-12',
    readingMinutes: 4,
});

const baseQuery: SearchQuery = {
    q: 'filas',
    categoria: null,
    autor: null,
    idioma: null,
    tags: [],
    periodo: null,
    ordem: 'recentes',
};

const options = {
    categories: [
        { slug: 'back-end', name: 'Back-end' },
        { slug: 'devops', name: 'DevOps' },
    ],
    languages: ['pt_BR' as const, 'en' as const],
    tags: ['laravel', 'php'],
};

function renderPage(props: Partial<Parameters<typeof SearchPage>[0]> = {}) {
    return render(
        <SearchPage
            query={baseQuery}
            filterCount={0}
            shortTerms={false}
            results={{
                data: [article(1), article(2)],
                currentPage: 1,
                lastPage: 1,
                total: 2,
            }}
            suggested={[]}
            options={options}
            category={null}
            {...props}
        />,
    );
}

describe('busca', () => {
    beforeEach(() => {
        testPage.url = '/busca?q=filas';
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: null },
        });
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: () => ({ matches: true }),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('mostra quantos resultados e os cartões', () => {
        renderPage();

        expect(
            screen.getByRole('heading', {
                level: 1,
                name: '2 resultados para “filas”',
            }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Artigo 1' })).toHaveAttribute(
            'href',
            '/artigos/artigo-1',
        );
    });

    it('os filtros abrem no painel e já buscam ao mudar', () => {
        const get = vi.spyOn(router, 'get').mockImplementation(() => {});
        renderPage();

        const toggle = screen.getByRole('button', { name: 'Filtros' });
        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-expanded', 'true');

        const panel = screen.getByRole('region', { name: 'Filtros' });
        fireEvent.change(within(panel).getByLabelText('Categoria'), {
            target: { value: 'devops' },
        });
        expect(get).toHaveBeenCalledWith(
            '/busca?q=filas&categoria=devops',
            {},
            expect.objectContaining({ preserveState: true }),
        );

        fireEvent.click(within(panel).getByLabelText('Último mês'));
        expect(get).toHaveBeenLastCalledWith(
            '/busca?q=filas&periodo=mes',
            {},
            expect.anything(),
        );
    });

    it('adiciona uma tag pelo "+ Tag"', () => {
        const get = vi.spyOn(router, 'get').mockImplementation(() => {});
        renderPage();
        fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));

        fireEvent.click(screen.getByRole('button', { name: '+ Tag' }));
        const input = screen.getByLabelText('Nova tag');
        fireEvent.change(input, { target: { value: '#Laravel' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(get).toHaveBeenCalledWith(
            '/busca?q=filas&tags%5B%5D=laravel',
            {},
            expect.anything(),
        );
    });

    it('cada filtro ativo tem o próprio "Remover"', () => {
        const get = vi.spyOn(router, 'get').mockImplementation(() => {});
        renderPage({
            query: { ...baseQuery, categoria: 'devops', tags: ['php'] },
            filterCount: 2,
        });

        expect(
            screen.getByRole('button', { name: 'Filtros · 2' }),
        ).toBeInTheDocument();
        fireEvent.click(
            screen.getByRole('button', { name: 'Remover filtro #php' }),
        );
        expect(get).toHaveBeenCalledWith(
            '/busca?q=filas&categoria=devops',
            {},
            expect.anything(),
        );
    });

    it('com termo curto, avisa que ele é limitado', () => {
        renderPage({ shortTerms: true });

        expect(screen.getByRole('status')).toHaveTextContent(
            'Termos curtos ainda são limitados',
        );
    });

    it('sem resultado, dá dicas e sugere os mais recentes da categoria', () => {
        const get = vi.spyOn(router, 'get').mockImplementation(() => {});
        renderPage({
            query: { ...baseQuery, q: 'kubernets', categoria: 'devops' },
            filterCount: 1,
            category: 'DevOps',
            results: { data: [], currentPage: 1, lastPage: 1, total: 0 },
            suggested: [article(3)],
        });

        expect(
            screen.getByRole('heading', {
                name: 'Nenhum artigo encontrado para “kubernets”',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Remova o filtro de categoria para buscar em todas.',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Mais recentes em DevOps' }),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Buscar em todas as categorias',
            }),
        );
        expect(get).toHaveBeenCalledWith(
            '/busca?q=kubernets',
            {},
            expect.anything(),
        );
    });
});
