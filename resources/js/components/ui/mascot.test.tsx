/// <reference types="node" />
import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import Mascot, { mascotArts, mascotUrls } from '@/components/ui/mascot';

describe('Mascote', () => {
    it('tem um arquivo para cada arte e uma arte para cada arquivo', () => {
        expect(Object.keys(mascotUrls).sort()).toEqual([...mascotArts].sort());
    });

    it('é sempre decorativo', () => {
        const { container } = render(<Mascot art="apresentando" size={200} />);
        const img = container.querySelector('img')!;

        expect(img).toHaveAttribute('alt', '');
        expect(img).toHaveAttribute('aria-hidden', 'true');
    });

    it('mostra a arte pedida a partir de 96 px', () => {
        const { container } = render(<Mascot art="procurando" size={96} />);

        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            mascotUrls.procurando,
        );
    });

    it('usa só o rosto abaixo de 96 px', () => {
        const { container } = render(<Mascot art="procurando" size={64} />);

        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            mascotUrls.rosto,
        );
    });

    it('cada ilustração pesa no máximo 80 KB', () => {
        // Gerados por design/mascote/converter.py; um PNG ou WEBP sem
        // compressão aqui deixaria as telas lentas.
        const folder = resolve(process.cwd(), 'resources/images/mascote');

        for (const file of readdirSync(folder)) {
            expect(file).toMatch(/\.webp$/);
            expect(statSync(resolve(folder, file)).size).toBeLessThanOrEqual(
                80 * 1024,
            );
        }
    });

    it('com sombra no chão, continua decorativo e a sombra acompanha a flutuação', () => {
        const { container } = render(
            <Mascot art="lendo" size={200} float grounded />,
        );
        const wrapper = container.firstElementChild!;

        expect(wrapper).toHaveAttribute('aria-hidden', 'true');
        expect(container.querySelector('img')).toHaveClass('animate-float');
        expect(container.querySelector('.mascot-shadow')).toHaveClass(
            'mascot-shadow-float',
        );
    });
});
