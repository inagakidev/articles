import { fireEvent, render, screen, within } from '@testing-library/react';
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
    favorites: { count: 5, favorited: false, canFavorite: false },
    report: { canReport: false, reported: false },
    comments: {
        total: 0,
        items: [],
        canComment: false,
        maxLength: 2000,
        page: 1,
        lastPage: 1,
    },
};

const noActions = {
    like: false,
    reply: false,
    edit: false,
    delete: false,
    moderate: false,
    report: false,
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
    reported: false,
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
            screen.getByRole('complementary', { name: 'Ações do artigo' }),
        ).toBeInTheDocument();

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

    it('visitante pode abrir o acesso ao curtir e vê os comentários sem formulário (RF-141)', () => {
        render(
            <Show
                article={article}
                likes={{ ...social.likes, canLike: true }}
                favorites={social.favorites}
                report={social.report}
                comments={{
                    ...social.comments,
                    total: 1,
                    items: [comment(1, { can: noActions })],
                }}
            />,
        );

        expect(screen.getAllByText('48 curtidas')).toHaveLength(2);
        fireEvent.click(
            screen.getAllByRole('button', {
                name: 'Curtir, 48 curtidas',
            })[0],
        );
        expect(
            screen.getByRole('dialog', { name: 'Entre para curtir' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
            'href',
            '/login',
        );
        expect(
            screen.getByRole('link', { name: 'Criar conta' }),
        ).toHaveAttribute('href', '/register');
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
                favorites={social.favorites}
                report={social.report}
                comments={{
                    total: 3,
                    canComment: true,
                    maxLength: 2000,
                    page: 1,
                    lastPage: 1,
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

        const likeButton = screen.getAllByRole('button', {
            name: 'Curtir, 48 curtidas',
        })[0];
        expect(likeButton).toHaveAttribute('aria-pressed', 'false');
        expect(likeButton).toHaveClass('size-10', 'flex-col', 'gap-0.5');
        expect(
            screen.getByRole('complementary', { name: 'Ações do artigo' })
                .firstElementChild,
        ).toHaveClass('gap-0.5', 'p-1.5', 'rounded-2xl');
        expect(
            screen.getByRole('complementary', { name: 'Ações do artigo' })
                .parentElement,
        ).toHaveClass('xl:gap-4');
        expect(likeButton.querySelector('svg')).toHaveClass('size-5');
        expect(
            screen.getAllByRole('link', { name: 'Ver os comentários (3)' })[0],
        ).toHaveClass('size-10', 'flex-col', 'gap-0.5');
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
                favorites={social.favorites}
                report={social.report}
                comments={{
                    total: 1,
                    canComment: true,
                    maxLength: 2000,
                    page: 1,
                    lastPage: 1,
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

    it('a conversa troca de página pelos botões, sem rolagem sem fim', () => {
        const { rerender } = render(<Show article={article} {...social} />);

        expect(
            screen.queryByRole('navigation', {
                name: 'Páginas de comentários',
            }),
        ).not.toBeInTheDocument();

        rerender(
            <Show
                article={article}
                likes={social.likes}
                favorites={social.favorites}
                report={social.report}
                comments={{
                    ...social.comments,
                    total: 6,
                    items: [comment(1)],
                    page: 1,
                    lastPage: 2,
                }}
            />,
        );

        const pages = screen.getByRole('navigation', {
            name: 'Páginas de comentários',
        });
        expect(
            within(pages).getByRole('link', { name: 'Próxima' }),
        ).toHaveAttribute('href', '/?comentarios=2');
        expect(
            within(pages).getByRole('link', { name: 'Página 1' }),
        ).toHaveAttribute('aria-current', 'page');
    });

    it('curtir, comentar e compartilhar são só ícones, com nome acessível', () => {
        render(<Show article={article} {...social} />);

        expect(
            screen.getAllByRole('link', { name: 'Ver os comentários (0)' })[0],
        ).toHaveAttribute('href', '#comentarios');
        expect(
            screen.getAllByRole('button', { name: 'Compartilhar' })[0],
        ).not.toHaveTextContent('Compartilhar');
    });

    it('a conversa vazia convida quem pode comentar, e o campo abre ao focar', () => {
        Object.assign(testPage.props, {
            auth: { user: { name: 'Lia Martins', email: 'lia@exemplo.dev' } },
        });
        render(
            <Show
                article={article}
                likes={social.likes}
                favorites={social.favorites}
                report={social.report}
                comments={{ ...social.comments, canComment: true }}
            />,
        );

        expect(
            screen.getByText('Seja a primeira pessoa a comentar'),
        ).toBeInTheDocument();

        const field = screen.getByLabelText('Escreva um comentário');
        expect(field).toHaveClass('h-12');
        fireEvent.focus(field);
        expect(field).toHaveClass('h-28');

        // O contador só aparece perto do limite
        expect(screen.queryByText('0 / 2.000')).not.toBeInTheDocument();
        fireEvent.change(field, { target: { value: 'a'.repeat(1850) } });
        expect(screen.getByText('1.850 / 2.000')).toBeInTheDocument();
    });

    it('comentários recentes mostram a data relativa, com a completa na dica', () => {
        const createdAt = new Date().toISOString();
        render(
            <Show
                article={article}
                likes={social.likes}
                favorites={social.favorites}
                report={social.report}
                comments={{
                    ...social.comments,
                    total: 1,
                    items: [comment(1, { createdAt })],
                }}
            />,
        );

        expect(screen.getByText('agora')).toHaveAttribute(
            'datetime',
            createdAt,
        );
    });

    it('favoritar mostra só o marcador, sem contador visível', () => {
        render(
            <Show
                article={article}
                {...social}
                favorites={{ count: 5, favorited: true, canFavorite: true }}
            />,
        );

        const button = screen.getAllByRole('button', {
            name: 'Favoritar',
        })[0];
        expect(button).toHaveAttribute('aria-pressed', 'true');
        expect(within(button).queryByText(/\d/)).toBeNull();
    });

    it('favoritar não expõe o contador na ação', () => {
        render(
            <Show
                article={article}
                {...social}
                likes={{ ...social.likes, count: 1 }}
                favorites={{ count: 1, favorited: false, canFavorite: true }}
            />,
        );

        expect(screen.getAllByText('1 curtida')[0]).toBeInTheDocument();
        expect(
            screen.getAllByRole('button', { name: 'Favoritar' })[0],
        ).toBeInTheDocument();
    });

    it('mantém os controles em 40px e os ícones em 20px', () => {
        render(
            <Show
                article={article}
                likes={{ ...social.likes, canLike: true }}
                favorites={{ ...social.favorites, canFavorite: true }}
                report={{ ...social.report, canReport: true }}
                comments={social.comments}
                moderation={{
                    articleId: 3,
                    policyItems: [{ id: '4.2', title: 'Fontes e atribuição' }],
                }}
            />,
        );

        const controls = [
            screen.getAllByRole('button', {
                name: 'Curtir, 48 curtidas',
            })[0],
            screen.getAllByRole('link', {
                name: 'Ver os comentários (0)',
            })[0],
            screen.getAllByRole('button', { name: 'Favoritar' })[0],
            screen.getAllByRole('button', { name: 'Compartilhar' })[0],
            screen.getAllByRole('button', { name: 'Denunciar artigo' })[0],
            screen.getAllByRole('button', { name: 'Moderação' })[0],
        ];

        for (const control of controls) {
            expect(control).toHaveClass('size-10');
            expect(control.querySelector('svg')).toHaveClass('size-5');
        }

        fireEvent.pointerDown(controls[5], { button: 0, ctrlKey: false });
        expect(
            screen.getByRole('menuitem', { name: 'Despublicar' }),
        ).toBeInTheDocument();
    });
});
