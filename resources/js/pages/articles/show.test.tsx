import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import Show from '@/pages/articles/show';

const article = {
    title: 'Filas no Laravel',
    language: 'pt_BR',
    category: { name: 'Back-end', color: 'blue' as const, slug: 'back-end' },
    tags: ['laravel'],
    cover: null,
    html: '<h2 id="worker">Quem tira o job</h2><p>Texto.</p>',
    toc: [{ id: 'worker', text: 'Quem tira o job', level: 2 }],
    readingMinutes: 9,
    author: {
        name: 'Rafa Moreira',
        username: 'rafa',
        bio: 'Dev back-end.',
        avatar: null,
    },
    publishedAt: '2026-11-12',
    updatedAt: null,
};

describe('leitura do artigo', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    it('mostra o artigo, quem escreveu e a data da publicação', () => {
        render(<Show article={article} />);

        expect(
            screen.getByRole('heading', { level: 1, name: 'Filas no Laravel' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Publicado em')).toHaveTextContent(
            'Publicado em 12 nov 2026',
        );
        expect(screen.queryByText(/Atualizado em/)).toBeNull();
        expect(
            screen.getByRole('link', { name: 'Ver perfil e outros artigos' }),
        ).toHaveAttribute('href', '/@rafa');
        expect(
            screen.getByRole('navigation', { name: 'Neste artigo' }),
        ).toBeInTheDocument();
    });

    it('diz quando foi atualizado (RF-137)', () => {
        render(<Show article={{ ...article, updatedAt: '2026-11-14' }} />);

        expect(screen.getByText(/Atualizado em/)).toHaveTextContent(
            'Atualizado em 14 nov 2026',
        );
    });

    it('no fim, leva a mais artigos da mesma categoria', () => {
        render(<Show article={article} />);

        expect(
            screen.getByText('Você chegou ao fim. Valeu pela leitura!'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Ver mais artigos de Back-end' }),
        ).toHaveAttribute('href', '/artigos?categoria=back-end');
    });

    it('de conta excluída, mostra o autor removido sem link de perfil', () => {
        render(
            <Show
                article={{
                    ...article,
                    author: {
                        name: 'Autor removido',
                        username: null,
                        bio: null,
                        avatar: null,
                    },
                }}
            />,
        );

        expect(screen.getAllByText('Autor removido').length).toBeGreaterThan(0);
        expect(
            screen.queryByRole('link', { name: 'Ver perfil e outros artigos' }),
        ).toBeNull();
    });
});
