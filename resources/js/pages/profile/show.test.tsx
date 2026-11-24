import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import ProfileShow from '@/pages/profile/show';
import type { ArticleSummary } from '@/types';

const profile = {
    name: 'Rafa Moreira',
    username: 'rafa-moreira',
    bio: 'Dev back-end.',
    avatar: null,
    memberSince: '2026-03-10',
};

const none = {
    data: [],
    currentPage: 1,
    lastPage: 1,
    total: 0,
    from: null,
    to: null,
};

const article = (number: number): ArticleSummary => ({
    url: `/artigos/artigo-${number}`,
    title: `Artigo ${number}`,
    excerpt: 'Resumo.',
    cover: null,
    category: null,
    author: { name: 'Rafa Moreira', avatar: null },
    publishedAt: '2026-11-12',
    readingMinutes: 4,
});

describe('perfil público', () => {
    beforeEach(() => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: null },
        });
    });

    it('mostra nome, username, bio, artigos e desde quando', () => {
        render(
            <ProfileShow profile={profile} articles={none} order="recentes" />,
        );

        expect(
            screen.getByRole('heading', { level: 1, name: 'Rafa Moreira' }),
        ).toBeInTheDocument();
        expect(screen.getByText('@rafa-moreira')).toBeInTheDocument();
        expect(screen.getByText('Dev back-end.')).toBeInTheDocument();
        expect(screen.getByText('0 artigos publicados')).toBeInTheDocument();
        expect(
            screen.getByText(/Na comunidade desde mar\. de 2026/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Rafa ainda não publicou artigos/),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('link', { name: 'Editar perfil' }),
        ).toBeNull();
    });

    it('para a própria pessoa, leva a editar o perfil', () => {
        Object.assign(testPage.props, {
            auth: { user: { name: 'Rafa Moreira', username: 'rafa-moreira' } },
        });
        render(
            <ProfileShow profile={profile} articles={none} order="recentes" />,
        );

        expect(
            screen.getByRole('link', { name: 'Editar perfil' }),
        ).toHaveAttribute('href', '/settings/profile');
        expect(
            screen.getByText('Seus artigos aparecem aqui depois da revisão.'),
        ).toBeInTheDocument();
    });

    it('lista os artigos, com ordem e páginas', () => {
        render(
            <ProfileShow
                profile={profile}
                articles={{
                    data: [article(1), article(2)],
                    currentPage: 1,
                    lastPage: 2,
                    total: 14,
                    from: 1,
                    to: 12,
                }}
                order="recentes"
            />,
        );

        expect(screen.getByText('14 artigos publicados')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Artigo 1' })).toHaveAttribute(
            'href',
            '/artigos/artigo-1',
        );
        expect(screen.getByLabelText('Ordenar por')).toHaveValue('recentes');
        expect(screen.getByRole('status')).toHaveTextContent(
            'Mostrando 1–12 de 14 artigos',
        );
        expect(screen.getByRole('link', { name: 'Próxima' })).toHaveAttribute(
            'href',
            '/@rafa-moreira?page=2',
        );
    });

    it('compartilha o perfil com o link dele', () => {
        render(
            <ProfileShow profile={profile} articles={none} order="recentes" />,
        );

        fireEvent.click(
            screen.getByRole('button', { name: 'Compartilhar perfil' }),
        );

        expect(
            screen.getByRole('dialog', { name: 'Compartilhar perfil' }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('Link do perfil')).toHaveValue(
            `${window.location.origin}/@rafa-moreira`,
        );
        expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
            'href',
            expect.stringContaining('wa.me/?text=Rafa%20Moreira'),
        );
    });
});
