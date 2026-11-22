import { fireEvent, render, screen } from '@testing-library/react';
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
    draft: {
        title: '',
        content: null,
        language: 'pt_BR',
        categoryId: null,
        tags: [],
        updatedAt: null,
        createdAt: null,
    },
    categories: [{ id: 1, name: 'Back-end', color: 'lavender' as const }],
    limits: { title: 150, characters: 50000, tags: 10, wordsPerMinute: 200 },
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
});
