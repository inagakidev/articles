import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import { MARQUEE_MIN } from '@/components/landing/community';
import Home from '@/pages/home';
import type { ArticleSummary } from '@/types';

const empty = {
    categories: [],
    recentArticles: [],
    authors: { count: 0, people: [] },
};

const article = (number: number): ArticleSummary => ({
    url: `/artigos/artigo-${number}`,
    title: `Artigo ${number}`,
    excerpt: 'Resumo do artigo.',
    cover: null,
    category: { name: 'Back-end', color: 'blue' },
    author: { name: 'Rafa Moreira', avatar: null },
    publishedAt: '2026-11-12',
    readingMinutes: 9,
});

describe('página de apresentação', () => {
    beforeEach(() => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: null },
        });
    });

    it('dá ao título animado um nome completo para leitores de tela', () => {
        render(<Home {...empty} />);

        expect(
            screen.getByRole('heading', {
                level: 1,
                name: 'Escreva o que aprendeu, o que construiu ou o que quebrou em produção.',
            }),
        ).toBeInTheDocument();
    });

    it('sem conteúdo publicado, convida a publicar e esconde categorias e autores', () => {
        render(<Home {...empty} />);

        expect(
            screen.getByRole('heading', {
                name: 'Os primeiros artigos estão chegando',
            }),
        ).toBeInTheDocument();
        expect(screen.queryByText(/^Categorias:/)).not.toBeInTheDocument();
        expect(
            screen.queryByText(/publicaram este mês/),
        ).not.toBeInTheDocument();
        expect(document.querySelector('.marquee')).toBeNull();
    });

    it('leva à listagem de artigos (D74)', () => {
        render(<Home {...empty} />);

        // Na abertura e na chamada final
        for (const link of screen.getAllByRole('link', {
            name: 'Ler os artigos',
        })) {
            expect(link).toHaveAttribute('href', '/artigos');
        }
        // Sem artigos ainda, "Ver todos os artigos" não aparece
        expect(
            screen.queryByRole('link', { name: 'Ver todos os artigos' }),
        ).toBeNull();
    });

    it('mostra categorias, artigos recentes e quem publicou', () => {
        render(
            <Home
                categories={[
                    { name: 'Front-end', color: 'lavender' },
                    { name: 'DevOps', color: 'pink' },
                ]}
                recentArticles={[article(1), article(2)]}
                authors={{
                    count: 42,
                    people: [{ name: 'Rafa Moreira', avatar: null }],
                }}
            />,
        );

        expect(
            screen.getByText('Categorias: Front-end, DevOps.'),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Artigo 1' })).toHaveAttribute(
            'href',
            '/artigos/artigo-1',
        );
        expect(screen.getAllByText(/9 min de leitura/)).toHaveLength(2);
        expect(
            screen.getByText('42 autores publicaram este mês'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Os primeiros artigos estão chegando'),
        ).toBeNull();
    });

    it.each([
        [1, 0],
        [5, 0],
        [6, 1],
        [11, 1],
        [12, 2],
    ])(
        'com %i artigos, mostra %i faixas rolantes, sem cartões repetidos lado a lado',
        (count, marquees) => {
            const articles = Array.from({ length: count }, (_, index) =>
                article(index + 1),
            );
            const { container } = render(
                <Home {...empty} recentArticles={articles} />,
            );
            const rows = container.querySelectorAll('.marquee');

            expect(rows).toHaveLength(marquees);
            rows.forEach((row) =>
                expect(
                    row.querySelectorAll(
                        '.marquee-track > div:first-child article',
                    ).length,
                ).toBeGreaterThanOrEqual(MARQUEE_MIN),
            );
            // A cópia que fecha a faixa fica fora do leitor de tela e do teclado
            expect(
                screen.getAllByRole('link', { name: /^Artigo \d+$/ }),
            ).toHaveLength(count);
        },
    );

    it('troca a jornada pelas abas, também com as setas', () => {
        render(<Home {...empty} />);
        const readers = screen.getByRole('tab', { name: 'Para quem lê' });
        const writers = screen.getByRole('tab', { name: 'Para quem escreve' });

        expect(readers).toHaveAttribute('aria-selected', 'true');
        expect(writers).toHaveAttribute('tabindex', '-1');
        expect(
            screen.getByRole('tabpanel', { name: 'Para quem lê' }),
        ).toHaveTextContent('Conteúdo técnico em que dá para confiar');

        fireEvent.keyDown(readers, { key: 'ArrowRight' });

        expect(writers).toHaveAttribute('aria-selected', 'true');
        expect(writers).toHaveFocus();
        const panel = screen.getByRole('tabpanel', {
            name: 'Para quem escreve',
        });
        expect(
            within(panel).getByRole('link', { name: 'Começar a escrever' }),
        ).toHaveAttribute('href', '/register');
    });

    it('abre uma pergunta por vez', () => {
        render(<Home {...empty} />);
        const first = screen.getByRole('button', {
            name: 'Preciso criar conta para ler?',
        });
        const review = screen.getByRole('button', {
            name: 'Quanto tempo leva a revisão?',
        });

        expect(first).toHaveAttribute('aria-expanded', 'true');
        expect(review).toHaveAttribute('aria-expanded', 'false');

        fireEvent.click(review);

        expect(review).toHaveAttribute('aria-expanded', 'true');
        expect(first).toHaveAttribute('aria-expanded', 'false');
        expect(
            screen.getByRole('region', {
                name: 'Quanto tempo leva a revisão?',
            }),
        ).toHaveTextContent('Até 6 horas.');
    });

    it('fala em inglês quando o idioma é inglês', () => {
        Object.assign(testPage.props, { locale: 'en' });
        render(<Home {...empty} />);

        expect(
            screen.getByRole('heading', {
                name: 'From draft to live, in three steps',
            }),
        ).toBeInTheDocument();
    });
});
