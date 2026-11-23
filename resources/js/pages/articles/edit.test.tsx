import { act, fireEvent, render, screen } from '@testing-library/react';
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import Edit from '@/pages/articles/edit';

const props = {
    articleId: null,
    published: false,
    hasPending: false,
    draft: {
        title: '',
        content: null,
        language: 'pt_BR',
        categoryId: null,
        tags: [],
        cover: null,
        updatedAt: null,
        createdAt: null,
    },
    images: {},
    categories: [{ id: 1, name: 'Back-end', color: 'lavender' as const }],
    limits: {
        title: 150,
        characters: 50000,
        tags: 10,
        wordsPerMinute: 200,
        images: 5,
        imageText: 250,
        imageMegabytes: 10,
    },
    colors: ['lavanda' as const, 'rosa' as const],
    codeLanguages: ['php', 'js'],
};

describe('editor do artigo', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.stubGlobal('fetch', vi.fn());
        Object.assign(testPage, { url: '/write' });
        Object.assign(testPage.props, {
            locale: 'pt_BR',
            auth: { user: { name: 'Rafa', email: 'rafa@exemplo.dev' } },
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('artigo novo: título, texto com barra de formatação e o que falta para enviar', () => {
        render(<Edit {...props} />);

        expect(
            screen.getByRole('textbox', { name: /Título/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('textbox', { name: 'Texto do artigo' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Negrito' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Ainda sem alterações')).toBeInTheDocument();
    });

    it('digitar o título conta os caracteres e só salva depois da pausa', () => {
        render(<Edit {...props} />);
        const title = screen.getByRole('textbox', { name: /Título/ });

        fireEvent.change(title, { target: { value: 'Filas' } });

        expect(screen.getByText('5 / 150')).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1200);

        expect(fetch).toHaveBeenCalledWith(
            '/articles',
            expect.objectContaining({ method: 'POST' }),
        );
    });

    it('imagem sem texto alternativo aparece em erro e entra no que falta', async () => {
        const id = '0f8c6a4e-1b2c-4d3e-8f90-123456789abc';
        render(
            <Edit
                {...props}
                articleId={3}
                draft={{
                    ...props.draft,
                    content: {
                        type: 'doc',
                        content: [{ type: 'image', attrs: { id } }],
                    },
                }}
                images={{ [id]: '/media/images/x/original.webp' }}
            />,
        );

        expect(
            screen.getAllByText('Descreva a imagem ou marque como decorativa.')
                .length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('Texto alternativo das imagens').length,
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByRole('button', { name: 'Corrigir' }).length,
        ).toBeGreaterThan(0);

        await act(async () => {
            fireEvent.click(
                screen.getAllByRole('checkbox', {
                    name: 'Imagem decorativa',
                })[0],
            );
            await vi.advanceTimersByTimeAsync(50);
        });

        expect(
            screen.queryByText('Descreva a imagem ou marque como decorativa.'),
        ).toBeNull();
        expect(screen.queryByRole('button', { name: 'Corrigir' })).toBeNull();
    });

    it('mostra a capa vazia, o botão de imagem e a contagem com o limite', () => {
        render(<Edit {...props} />);

        expect(
            screen.getAllByRole('button', { name: /Enviar imagem de capa/ })
                .length,
        ).toBeGreaterThan(0);
        expect(
            screen.getByRole('button', { name: 'Imagem' }),
        ).toBeInTheDocument();
        expect(screen.getAllByText('limite de 5').length).toBeGreaterThan(0);
    });
});
