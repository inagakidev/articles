import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import Preview from '@/pages/articles/preview';

const article = {
    title: 'Filas no Laravel',
    language: 'pt_BR',
    category: { name: 'Back-end', color: 'lavender' as const },
    tags: ['laravel', 'filas'],
    cover: null,
    html: '<h2 id="quem-tira">Quem tira o job</h2><pre class="code-block" data-language="php"><code>echo 1;</code></pre>',
    toc: [{ id: 'quem-tira', text: 'Quem tira o job', level: 2 }],
    readingMinutes: 4,
    author: {
        name: 'Rafa Moreira',
        username: 'rafa',
        bio: 'Dev back-end.',
        avatar: null,
    },
};

describe('prévia do artigo', () => {
    beforeEach(() => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
    });

    it('mostra o artigo como vai ao ar, com volta para a edição', () => {
        render(<Preview articleId={7} article={article} />);

        expect(
            screen.getByRole('heading', { level: 1, name: 'Filas no Laravel' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { level: 2, name: 'Quem tira o job' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Back-end')).toBeInTheDocument();
        expect(screen.getByText(/4 min/)).toBeInTheDocument();
        expect(screen.getByText('Dev back-end.')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /Voltar a editar/ }),
        ).toHaveAttribute('href', '/articles/7/edit');
        expect(
            screen.getByRole('button', { name: /Copiar/ }),
        ).toBeInTheDocument();
    });

    it('sem título, usa o aviso de rascunho sem título', () => {
        render(<Preview articleId={7} article={{ ...article, title: null }} />);

        expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent(
            /^$/,
        );
    });

    it('mostra a capa com o texto alternativo e os tamanhos', () => {
        render(
            <Preview
                articleId={7}
                article={{
                    ...article,
                    cover: {
                        src: '/media/images/a/960.webp',
                        srcset: '/media/images/a/480.webp 480w, /media/images/a/960.webp 960w',
                        width: 1600,
                        height: 900,
                        alt: 'Fila de jobs',
                    },
                }}
            />,
        );

        expect(
            screen.getByRole('img', { name: 'Fila de jobs' }),
        ).toHaveAttribute(
            'srcset',
            '/media/images/a/480.webp 480w, /media/images/a/960.webp 960w',
        );
    });
});
