import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import SiteLogo from '@/layouts/parts/site-logo';

function renderLogo(props: Parameters<typeof SiteLogo>[0] = {}) {
    Object.assign(testPage.props, { name: 'he4rt ink' });

    return render(<SiteLogo {...props} />);
}

function sources(container: HTMLElement) {
    return [...container.querySelectorAll('img')].map((img) =>
        img.getAttribute('src'),
    );
}

describe('logo do site', () => {
    it('é um link para a página inicial com o nome do produto', () => {
        renderLogo();

        expect(
            screen.getByRole('link', { name: 'he4rt ink' }),
        ).toBeInTheDocument();
    });

    it('as imagens são decorativas e existem para os dois temas', () => {
        const { container } = renderLogo();
        const images = container.querySelectorAll('img');

        expect(images).toHaveLength(2);
        images.forEach((img) => {
            expect(img).toHaveAttribute('alt', '');
            expect(img).toHaveAttribute('aria-hidden', 'true');
        });
        expect(new Set(sources(container)).size).toBe(2);
    });

    it('usa a versão com tagline no rodapé', () => {
        const plain = sources(renderLogo().container);
        const withTagline = sources(
            renderLogo({ withTagline: true }).container,
        );

        expect(withTagline).toHaveLength(2);
        expect(withTagline).not.toEqual(plain);
    });

    it('no celular pode mostrar só o ícone', () => {
        const plain = sources(renderLogo().container);
        const compact = sources(
            renderLogo({ compactOnMobile: true }).container,
        );

        // Ícone e logo completa, cada um nos dois temas; o CSS escolhe qual aparece.
        expect(compact).toHaveLength(4);
        expect(compact).toEqual(expect.arrayContaining(plain));
    });
});
