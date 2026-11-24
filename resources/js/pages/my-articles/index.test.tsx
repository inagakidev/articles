import { fireEvent, render, screen, within } from '@testing-library/react';
import { router } from '@inertiajs/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import type { MyArticle, MySections } from '@/components/my-articles/types';
import MyArticles from '@/pages/my-articles/index';

const now = new Date().toISOString();

function article(overrides: Partial<MyArticle> = {}): MyArticle {
    return {
        id: 1,
        versionId: 10,
        title: 'Filas no Laravel',
        words: 640,
        updatedAt: now,
        hasDraft: false,
        pendingSubmittedAt: null,
        ...overrides,
    };
}

const empty: MySections = {
    drafts: [],
    review: [],
    rejected: [],
    published: [],
};

describe('Meus artigos', () => {
    beforeEach(() => {
        Object.assign(testPage, { url: '/my-articles', flash: {} });
        Object.assign(testPage.props, { locale: 'pt_BR' });
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: true,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })),
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('autor sem artigos vê o convite para o primeiro rascunho, sem seções vazias', () => {
        render(<MyArticles sections={empty} trashCount={0} reviewHours={6} />);

        expect(
            screen.getByText('Seu primeiro artigo começa como rascunho'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /Escrever artigo/ }),
        ).toHaveAttribute('href', '/write');
        expect(screen.queryByRole('navigation', { name: 'Seções' })).toBeNull();
        expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
    });

    it('mostra só as seções com artigos, cada uma com a ação do estado', () => {
        render(
            <MyArticles
                sections={{
                    ...empty,
                    drafts: [article()],
                    review: [
                        article({
                            id: 2,
                            title: 'Inertia',
                            submittedAt: now,
                            pendingSubmittedAt: now,
                        }),
                    ],
                    published: [
                        article({
                            id: 3,
                            title: 'Git',
                            url: '/artigos/git',
                            firstPublishedAt: now,
                            currentSince: now,
                            pendingSubmittedAt: now,
                        }),
                    ],
                }}
                trashCount={1}
                reviewHours={6}
            />,
        );

        const nav = screen.getByRole('navigation', { name: 'Seções' });
        expect(
            within(nav)
                .getAllByRole('link')
                .map((link) => link.textContent),
        ).toEqual([
            'Rascunhos1',
            'Aguardando revisão1',
            'Publicados1',
            'Lixeira (1)',
        ]);
        expect(
            screen.getByRole('link', {
                name: 'Continuar escrevendo: Filas no Laravel',
            }),
        ).toHaveAttribute('href', '/articles/1/edit');
        expect(
            screen.getByText(/A revisão leva até 6 horas/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Ver versão enviada de Inertia' }),
        ).toHaveAttribute('href', '/articles/2/preview?version=10');
        expect(
            screen.getByText('Edição aguardando revisão'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Retirar da fila a edição de Git',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Ver artigo Git' }),
        ).toHaveAttribute('href', '/artigos/git');
    });

    it('retirar da fila com rascunho mais novo pede a escolha antes', () => {
        const remove = vi.spyOn(router, 'delete').mockImplementation(() => {});
        render(
            <MyArticles
                sections={{
                    ...empty,
                    drafts: [
                        article({ hasDraft: true, pendingSubmittedAt: now }),
                    ],
                }}
                trashCount={0}
                reviewHours={6}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Retirar da fila: Filas no Laravel',
            }),
        );

        expect(remove).not.toHaveBeenCalled();
        expect(
            screen.getByRole('dialog', {
                name: 'Qual versão você quer manter?',
            }),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('radio', { name: /Versão que estava na fila/ }),
        );
        fireEvent.click(
            screen.getByRole('button', { name: 'Manter a escolhida' }),
        );

        expect(remove).toHaveBeenCalledWith(
            '/articles/1/submission',
            expect.objectContaining({ data: { keep: 'pending' } }),
        );
    });

    it('depois do envio, mostra o aviso com a estimativa e a retirada', () => {
        Object.assign(testPage, {
            flash: { submitted: { articleId: 2, title: 'Inertia' } },
        });
        render(
            <MyArticles
                sections={{
                    ...empty,
                    review: [
                        article({ id: 2, title: 'Inertia', submittedAt: now }),
                    ],
                }}
                trashCount={0}
                reviewHours={6}
            />,
        );

        const status = screen
            .getAllByRole('status')
            .find((el) => el.textContent?.includes('foi enviado para revisão'));
        expect(status).toBeDefined();
        expect(within(status!).getByText(/até 6 horas/)).toBeInTheDocument();
        expect(
            within(status!).getByRole('button', { name: 'Retirar da fila' }),
        ).toBeInTheDocument();
    });
});
