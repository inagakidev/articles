import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import Audit from '@/pages/admin/audit';
import Queue from '@/pages/admin/queue';
import Review from '@/pages/admin/review';

const article = {
    title: 'Filas no Laravel',
    language: 'pt_BR',
    category: { name: 'Back-end', color: 'blue' as const, slug: 'back-end' },
    tags: ['laravel'],
    cover: null,
    html: '<p>Texto.</p>',
    toc: [],
    readingMinutes: 4,
    author: {
        name: 'Lia Martins',
        username: 'lia-martins',
        bio: null,
        avatar: null,
    },
};

const page = { currentPage: 1, lastPage: 1, from: 1, to: 1 };

describe('moderação no painel', () => {
    beforeEach(() => {
        testPage.url = '/admin/queue';
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: { name: 'Amanda', email: 'a@exemplo.dev' } },
        });
    });

    it('a fila mostra o tipo, o atraso e o link para revisar', () => {
        render(
            <Queue
                versions={{
                    ...page,
                    total: 1,
                    data: [
                        {
                            id: 7,
                            title: 'Filas no Laravel',
                            author: {
                                name: 'Lia Martins',
                                username: 'lia-martins',
                                avatar: null,
                            },
                            type: 'edit',
                            category: 'Back-end',
                            submittedAt: new Date(
                                Date.now() - 7 * 3600_000,
                            ).toISOString(),
                            late: true,
                        },
                    ],
                }}
                filters={{ q: null, tipo: null }}
                lateHours={6}
            />,
        );

        const table = screen.getByRole('table', {
            name: 'Versões aguardando aprovação',
        });
        expect(
            within(table).getByText('Edição de publicado'),
        ).toBeInTheDocument();
        expect(within(table).getByText('7 h · atrasada')).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: 'Revisar edição de Filas no Laravel',
            }),
        ).toHaveAttribute('href', '/admin/versions/7');
    });

    it('a revisão pede item e justificativa só para rejeitar', () => {
        render(
            <Review
                version={{
                    id: 7,
                    submittedAt: new Date().toISOString(),
                    late: false,
                    edit: false,
                    liveUrl: null,
                    words: 1240,
                    images: 3,
                    imagesWithAlt: 3,
                    links: 4,
                }}
                article={article}
                policyItems={[{ id: '4.2', title: 'Fontes e atribuição' }]}
                queue={{ count: 5, previous: null, next: 8 }}
                lateHours={6}
            />,
        );

        expect(
            screen.getByText('Texto alternativo em 3 de 3 imagens'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Aprovar e publicar' }),
        ).toBeDisabled();

        fireEvent.click(screen.getByLabelText('Aprovar'));
        expect(
            screen.queryByLabelText('Item da Política de conteúdo'),
        ).toBeNull();

        fireEvent.click(screen.getByLabelText('Rejeitar'));
        expect(
            screen.getByLabelText('Item da Política de conteúdo'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Justificativa para quem escreveu'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Rejeitar versão' }),
        ).toBeEnabled();
    });

    it('a auditoria lista as ações e exporta o filtro', () => {
        render(
            <Audit
                records={{
                    ...page,
                    total: 1,
                    data: [
                        {
                            id: 1,
                            createdAt: '2026-11-18T09:12:00Z',
                            actor: 'Amanda',
                            action: 'Rejeitou versão',
                            target: '“Zustand ou Context” de @lia-martins',
                            item: '4.2',
                            reason: 'Números sem fonte.',
                        },
                    ],
                }}
                filters={{ q: null, acao: 'version_rejected', periodo: 30 }}
                actions={[
                    { value: 'version_rejected', label: 'Rejeitou versão' },
                ]}
                periods={[7, 30, 90]}
            />,
        );

        expect(screen.getByText('Números sem fonte.')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Exportar CSV' }),
        ).toHaveAttribute(
            'href',
            '/admin/audit/export?acao=version_rejected&periodo=30',
        );
    });
});
