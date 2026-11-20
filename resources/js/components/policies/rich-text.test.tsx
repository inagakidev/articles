import { render } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import '@/test/inertia';
import RichText from '@/components/policies/rich-text';

describe('texto das políticas', () => {
    it('mostra negrito e links internos e de e-mail', () => {
        const { container } = render(
            <RichText text="**Público:** veja a [Privacidade](/privacy) ou escreva para [nós](mailto:a@b.dev)." />,
        );

        expect(container.querySelector('strong')).toHaveTextContent('Público:');
        expect(container.querySelector('a[href="/privacy"]')).toHaveTextContent(
            'Privacidade',
        );
        expect(
            container.querySelector('a[href="mailto:a@b.dev"]'),
        ).toHaveTextContent('nós');
    });

    it('nunca vira HTML nem link para outro site', () => {
        const { container } = render(
            <RichText text="<img src=x onerror=alert(1)> [clique](https://outro.site) [js](javascript:alert(1)) [rede](//outro.site)" />,
        );

        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('a')).toBeNull();
        expect(container).toHaveTextContent('clique');
    });
});
