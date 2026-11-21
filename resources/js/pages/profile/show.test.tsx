import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import ProfileShow from '@/pages/profile/show';

const profile = {
    name: 'Rafa Moreira',
    username: 'rafa-moreira',
    bio: 'Dev back-end.',
    avatar: null,
    memberSince: '2026-03-10',
};

describe('perfil público', () => {
    beforeEach(() => {
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: null },
        });
    });

    it('mostra nome, username, bio, artigos e desde quando', () => {
        render(
            <ProfileShow profile={profile} articles={[]} articleCount={0} />,
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
            <ProfileShow profile={profile} articles={[]} articleCount={0} />,
        );

        expect(
            screen.getByRole('link', { name: 'Editar perfil' }),
        ).toHaveAttribute('href', '/settings/profile');
        expect(
            screen.getByText('Seus artigos aparecem aqui depois da revisão.'),
        ).toBeInTheDocument();
    });
});
