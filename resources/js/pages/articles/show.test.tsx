import { fireEvent, render, screen } from '@testing-library/react';
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

const social = {
    likes: { articleId: 3, count: 48, liked: false, canLike: false },
    comments: { total: 0, items: [], canComment: false, maxLength: 2000 },
};

const noActions = {
    like: false,
    reply: false,
    edit: false,
    delete: false,
    moderate: false,
};

const comment = (id: number, extra = {}) => ({
    id,
    body: `Comentário ${id}`,
    depth: 1,
    createdAt: '2026-11-13T10:00:00Z',
    edited: false,
    author: { name: 'Bia Tanaka', username: 'bia', avatar: null },
    isArticleAuthor: false,
    own: false,
    likes: { count: 7, liked: true },
    can: { ...noActions, like: true, reply: true },
    replies: [],
    ...extra,
});

describe('leitura do artigo', () => {
    beforeEach(() => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: null },
        });
    });

    it('mostra o artigo, quem escreveu e a data da publicação', () => {
        render(<Show article={article} {...social} />);

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
        // A tag leva à busca por ela
        expect(screen.getByRole('link', { name: '#laravel' })).toHaveAttribute(
            'href',
            '/busca?tags%5B%5D=laravel',
        );
    });

    it('diz quando foi atualizado (RF-137)', () => {
        render(
            <Show
                article={{ ...article, updatedAt: '2026-11-14' }}
                {...social}
            />,
        );

        expect(screen.getByText(/Atualizado em/)).toHaveTextContent(
            'Atualizado em 14 nov 2026',
        );
    });

    it('no fim, leva a mais artigos da mesma categoria', () => {
        render(<Show article={article} {...social} />);

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
                {...social}
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

    it('compartilha o artigo pelas redes e pelo link (RF-163)', () => {
        render(<Show article={article} {...social} />);

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Compartilhar' })[0],
        );

        const dialog = screen.getByRole('dialog', {
            name: 'Compartilhar artigo',
        });
        expect(dialog).toBeInTheDocument();
        for (const network of [
            'WhatsApp',
            'LinkedIn',
            'Facebook',
            'X',
            'E-mail',
        ]) {
            expect(
                screen.getByRole('link', { name: network }),
            ).toBeInTheDocument();
        }
        expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
            'target',
            '_blank',
        );
        expect(
            screen.getByRole('button', { name: 'Copiar link' }),
        ).toBeInTheDocument();
    });

    it('visitante vê as curtidas e os comentários, sem formulário (RF-141)', () => {
        render(
            <Show
                article={article}
                likes={social.likes}
                comments={{
                    ...social.comments,
                    total: 1,
                    items: [comment(1, { can: noActions })],
                }}
            />,
        );

        expect(screen.getAllByLabelText('48 curtidas')).toHaveLength(2);
        expect(screen.queryByRole('button', { name: /Curtir,/ })).toBeNull();
        expect(screen.getByText('Comentário 1')).toBeInTheDocument();
        expect(screen.queryByLabelText('Escreva um comentário')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Responder' })).toBeNull();
    });

    it('quem participa curte, comenta e responde em até 3 níveis', () => {
        Object.assign(testPage.props, {
            auth: { user: { name: 'Lia Martins', email: 'lia@exemplo.dev' } },
        });
        render(
            <Show
                article={article}
                likes={{ ...social.likes, canLike: true }}
                comments={{
                    total: 3,
                    canComment: true,
                    maxLength: 2000,
                    items: [
                        comment(1, {
                            replies: [
                                comment(2, {
                                    depth: 2,
                                    replies: [
                                        comment(3, {
                                            depth: 3,
                                            can: { ...noActions, like: true },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }}
            />,
        );

        expect(
            screen.getAllByRole('button', { name: 'Curtir, 48 curtidas' })[0],
        ).toHaveAttribute('aria-pressed', 'false');
        expect(
            screen.getByLabelText('Escreva um comentário'),
        ).toBeInTheDocument();
        expect(
            screen.getAllByRole('button', { name: 'Responder' }),
        ).toHaveLength(2);

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Responder' })[0],
        );
        expect(
            screen.getByLabelText('Escreva sua resposta'),
        ).toBeInTheDocument();
    });

    it('o próprio comentário mostra só a contagem e o menu de ações', () => {
        Object.assign(testPage.props, {
            auth: { user: { name: 'Bia Tanaka', email: 'bia@exemplo.dev' } },
        });
        render(
            <Show
                article={article}
                likes={social.likes}
                comments={{
                    total: 1,
                    canComment: true,
                    maxLength: 2000,
                    items: [
                        comment(1, {
                            own: true,
                            likes: { count: 2, liked: false },
                            can: {
                                ...noActions,
                                reply: true,
                                edit: true,
                                delete: true,
                            },
                        }),
                    ],
                }}
            />,
        );

        expect(screen.getByText('Você')).toBeInTheDocument();
        expect(
            screen.getByTitle('Você não curte o próprio comentário'),
        ).toHaveTextContent('2');
        expect(
            screen.getByRole('button', {
                name: 'Mais ações do comentário de Bia Tanaka',
            }),
        ).toBeInTheDocument();
    });
});
