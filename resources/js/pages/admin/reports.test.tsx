import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import '@/test/inertia';
import Reports from '@/pages/admin/reports';

const caio = { name: 'Caio Lima', username: 'caio-lima', avatar: null };

const base = {
    filters: { status: 'abertas' as const, tipo: null },
    openCount: 2,
    groups: {
        data: [
            {
                target: 'comment' as const,
                id: 12,
                count: 2,
                priority: true,
                since: '2026-11-17T10:00:00Z',
                reasons: ['offensive'],
                item: {
                    title: 'Modais acessíveis',
                    text: 'Volta pro tutorial.',
                    author: caio,
                    url: '/artigos/modais#comentario-12',
                    replies: 2,
                },
            },
            {
                target: 'profile' as const,
                id: 7,
                count: 1,
                priority: false,
                since: '2026-11-15T10:00:00Z',
                reasons: ['other'],
                item: {
                    title: null,
                    text: 'Compre cursos!',
                    author: { ...caio, username: 'compre-cursos' },
                    url: '/@compre-cursos',
                    replies: null,
                    hasPhoto: true,
                },
            },
        ],
        currentPage: 1,
        lastPage: 1,
        total: 2,
    },
};

const selected = {
    target: 'comment' as const,
    id: 12,
    item: base.groups.data[0].item,
    status: 'open' as const,
    reasons: { offensive: 2 },
    details: ['Ataque pessoal à autora.'],
    count: 2,
    outcomes: ['delete_comment' as const, 'dismiss' as const],
    decision: null,
};

describe('denúncias no painel', () => {
    it('uma linha por item, com quantas denúncias e os motivos', () => {
        render(<Reports {...base} />);

        const table = screen.getByRole('table', { name: 'Denúncias por item' });
        const rows = within(table).getAllByRole('row');
        expect(rows[1]).toHaveTextContent('2 denúncias');
        expect(rows[1]).toHaveTextContent('Ofensa ou assédio');
        expect(rows[2]).toHaveTextContent('Foto, bio e username');
        expect(
            screen.getByRole('link', { name: 'Abertas · 2' }),
        ).toHaveAttribute('aria-current', 'page');
    });

    it('a análise mostra o conteúdo atual e o aviso das respostas ao excluir', () => {
        render(
            <Reports
                {...base}
                selected={selected}
                policyItems={[{ id: '2.1', title: 'Ofensa e assédio' }]}
                neighbours={{ previous: null, next: null }}
            />,
        );

        const analysis = screen.getByRole('region', {
            name: 'Denúncia de comentário',
        });
        expect(analysis).toHaveTextContent('“Volta pro tutorial.”');
        expect(analysis).toHaveTextContent('ofensa ou assédio (2)');
        expect(analysis).toHaveTextContent('Ataque pessoal à autora.');

        fireEvent.click(
            within(analysis).getByRole('radio', {
                name: 'Procedente: excluir o comentário',
            }),
        );
        expect(analysis).toHaveTextContent(
            'Excluir o comentário apaga também as 2 respostas a ele.',
        );
        expect(
            within(analysis).getByLabelText('Item da Política de conteúdo'),
        ).toBeInTheDocument();

        fireEvent.click(
            within(analysis).getByRole('radio', { name: 'Improcedente' }),
        );
        expect(
            within(analysis).queryByLabelText('Item da Política de conteúdo'),
        ).not.toBeInTheDocument();
        expect(
            within(analysis).getByRole('button', {
                name: 'Marcar como improcedente',
            }),
        ).toBeEnabled();
    });

    it('perfil: escolhe o que redefinir', () => {
        render(
            <Reports
                {...base}
                selected={{
                    ...selected,
                    target: 'profile',
                    id: 7,
                    item: base.groups.data[1].item,
                    outcomes: ['moderate_profile', 'dismiss'],
                }}
                policyItems={[]}
            />,
        );

        fireEvent.click(
            screen.getByRole('radio', {
                name: 'Procedente: redefinir o perfil',
            }),
        );

        expect(
            screen.getByRole('checkbox', { name: 'Foto (volta às iniciais)' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('checkbox', { name: 'Bio (fica vazia)' }),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                'Username (troca obrigatória no próximo acesso)',
            ),
        ).toBeInTheDocument();
    });
});
