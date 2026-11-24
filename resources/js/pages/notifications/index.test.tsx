import { router } from '@inertiajs/react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import type { NotificationItem } from '@/components/notifications/types';
import '@/test/inertia';
import Notifications from '@/pages/notifications/index';

const now = new Date().toISOString();

const notice = (extra: Partial<NotificationItem>): NotificationItem => ({
    id: 'a1',
    type: 'article.approved',
    read: false,
    at: now,
    href: '/notificacoes/a1',
    title: 'Tipos utilitários do TypeScript',
    edit: false,
    policyItem: null,
    actor: null,
    excerpt: null,
    target: null,
    count: null,
    ...extra,
});

const page = (data: NotificationItem[], unread = 0) => ({
    filter: 'todas' as const,
    unread,
    retentionDays: 90,
    list: { data, currentPage: 1, lastPage: 1, total: data.length },
});

describe('notificações', () => {
    afterEach(() => vi.restoreAllMocks());

    it('monta cada tipo no idioma de quem lê, por dia', () => {
        render(
            <Notifications
                {...page(
                    [
                        notice({}),
                        notice({
                            id: 'b2',
                            type: 'like.received',
                            target: 'article',
                            count: 5,
                        }),
                        notice({
                            id: 'c3',
                            type: 'comment.posted',
                            read: true,
                            actor: { name: 'Caio Lima', username: 'caio' },
                            excerpt: 'O foco volta?',
                        }),
                        notice({
                            id: 'd4',
                            type: 'article.rejected',
                            read: true,
                            at: '2026-11-01T10:00:00Z',
                            policyItem: '4.2',
                        }),
                    ],
                    2,
                )}
            />,
        );

        const today = screen.getByRole('region', { name: 'Hoje' });
        expect(
            within(today).getByRole('link', {
                name: /Não lida\. Seu artigo foi aprovado\./,
            }),
        ).toHaveAttribute('href', '/notificacoes/a1');
        expect(
            within(today).getByText('5 pessoas curtiram'),
        ).toBeInTheDocument();
        expect(
            within(today).getByText('Caio Lima comentou'),
        ).toBeInTheDocument();
        expect(
            within(
                screen.getByRole('region', { name: 'Anteriores' }),
            ).getByText(/Política de conteúdo, item 4\.2/),
        ).toBeInTheDocument();

        // Só as não lidas têm "Marcar como lida"
        expect(
            screen.getAllByRole('button', { name: 'Marcar como lida' }),
        ).toHaveLength(2);
        expect(
            screen.getByRole('link', { name: 'Não lidas · 2' }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/ficam guardadas por 90 dias/),
        ).toBeInTheDocument();
    });

    it('marca, exclui e limpa as lidas', () => {
        const patch = vi.spyOn(router, 'patch').mockImplementation(() => {});
        const remove = vi.spyOn(router, 'delete').mockImplementation(() => {});
        render(
            <Notifications
                {...page([notice({}), notice({ id: 'b2', read: true })], 1)}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', { name: 'Marcar como lida' }),
        );
        fireEvent.click(
            screen.getByRole('button', { name: 'Marcar todas como lidas' }),
        );
        fireEvent.click(
            screen.getAllByRole('button', { name: 'Excluir notificação' })[1],
        );
        fireEvent.click(screen.getByRole('button', { name: 'Limpar lidas' }));

        expect(patch).toHaveBeenNthCalledWith(
            1,
            '/notifications/a1/read',
            {},
            expect.anything(),
        );
        expect(patch).toHaveBeenNthCalledWith(
            2,
            '/notifications/read',
            {},
            expect.anything(),
        );
        expect(remove).toHaveBeenNthCalledWith(
            1,
            '/notifications/b2',
            expect.anything(),
        );
        expect(remove).toHaveBeenNthCalledWith(
            2,
            '/notifications/read',
            expect.anything(),
        );
    });

    it('sem notificações, o mascote e o caminho para Meus artigos', () => {
        render(<Notifications {...page([])} />);

        expect(screen.getByText('Tudo tranquilo por aqui')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Ver meus artigos' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Marcar todas como lidas' }),
        ).not.toBeInTheDocument();
    });
});
