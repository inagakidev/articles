import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import type { AdminTag } from '@/components/admin/taxonomy/types';
import Taxonomy from '@/pages/admin/taxonomy';

const categories = [
    {
        id: 1,
        namePtBr: 'Banco de dados',
        nameEn: 'Databases',
        color: 'yellow' as const,
        articles: 2,
    },
    {
        id: 2,
        namePtBr: 'Front-end',
        nameEn: 'Front-end',
        color: 'lavender' as const,
        articles: 0,
    },
];

const tags = (data: AdminTag[] = []) => ({
    data,
    current_page: 1,
    last_page: 1,
    prev_page_url: null,
    next_page_url: null,
    total: data.length,
});

describe('categorias e tags', () => {
    beforeEach(() => {
        Object.assign(testPage, { url: '/admin/taxonomy' });
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    it('lista as categorias com o uso e ações com nome', () => {
        render(
            <Taxonomy
                categories={categories}
                colors={['yellow', 'lavender']}
                tags={tags()}
                search=""
            />,
        );
        const table = screen.getByRole('region', { name: 'Categorias' });

        expect(within(table).getByText('Banco de dados')).toBeInTheDocument();
        expect(within(table).getByText('2 artigos')).toBeInTheDocument();
        expect(within(table).getByText('0 artigos')).toBeInTheDocument();
        expect(
            within(table).getByRole('button', {
                name: 'Excluir Banco de dados',
            }),
        ).toBeInTheDocument();
    });

    it('excluir categoria em uso pede o destino e diz quantos artigos mudam', () => {
        render(
            <Taxonomy
                categories={categories}
                colors={['yellow']}
                tags={tags()}
                search=""
            />,
        );

        fireEvent.click(
            screen.getByRole('button', { name: 'Excluir Banco de dados' }),
        );

        const dialog = screen.getByRole('dialog', {
            name: 'Excluir “Banco de dados”',
        });
        expect(
            within(dialog).getByLabelText('Transferir para'),
        ).toHaveDisplayValue('Front-end');
        expect(
            within(dialog).getByRole('button', {
                name: 'Transferir 2 artigos e excluir',
            }),
        ).toBeInTheDocument();
    });

    it('mostra o nome no idioma da página', () => {
        Object.assign(testPage.props, { locale: 'en' });
        render(
            <Taxonomy
                categories={categories}
                colors={['yellow']}
                tags={tags()}
                search=""
            />,
        );

        expect(screen.getByText('Databases')).toBeInTheDocument();
    });

    it('mostra o estado de cada tag e a união sugerida', () => {
        render(
            <Taxonomy
                categories={categories}
                colors={['yellow']}
                tags={tags([
                    {
                        id: 1,
                        name: 'react',
                        articles: 4,
                        blocked: false,
                        mergeInto: null,
                    },
                    {
                        id: 2,
                        name: 'reactjs',
                        articles: 1,
                        blocked: false,
                        mergeInto: { id: 1, name: 'react' },
                    },
                    {
                        id: 3,
                        name: 'ganhe-dinheiro',
                        articles: 1,
                        blocked: true,
                        mergeInto: null,
                    },
                ])}
                search=""
            />,
        );

        expect(screen.getByText('Normalizada')).toBeInTheDocument();
        expect(screen.getByText('Parecida com “react”')).toBeInTheDocument();
        expect(screen.getByText('Bloqueada')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Unir reactjs com “react”' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Desbloquear ganhe-dinheiro' }),
        ).toBeInTheDocument();
    });

    it('busca sem resultado oferece limpar a busca', () => {
        render(
            <Taxonomy
                categories={categories}
                colors={['yellow']}
                tags={tags()}
                search="kubernets"
            />,
        );

        expect(screen.getByText('Nenhuma tag “kubernets”')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Limpar busca' }),
        ).toHaveAttribute('href', '/admin/taxonomy');
    });
});
