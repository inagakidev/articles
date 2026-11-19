import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Mascot, { mascotArts, mascotUrls } from '@/components/mascot';

describe('Mascote', () => {
    it('tem um arquivo para cada arte e uma arte para cada arquivo', () => {
        expect(Object.keys(mascotUrls).sort()).toEqual([...mascotArts].sort());
    });

    it('é sempre decorativo', () => {
        const { container } = render(<Mascot art="pose-acenando" size={200} />);
        const img = container.querySelector('img')!;

        expect(img).toHaveAttribute('alt', '');
        expect(img).toHaveAttribute('aria-hidden', 'true');
    });

    it('mostra a arte pedida a partir de 96 px', () => {
        const { container } = render(<Mascot art="pose-lupa" size={96} />);

        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            mascotUrls['pose-lupa'],
        );
    });

    it('usa o avatar entre 24 e 96 px', () => {
        const { container } = render(<Mascot art="pose-lupa" size={64} />);

        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            mascotUrls['mascote-avatar'],
        );
    });

    it('usa só o marcador abaixo de 24 px', () => {
        const { container } = render(<Mascot art="pose-lupa" size={20} />);

        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('svg')).toHaveAttribute(
            'aria-hidden',
            'true',
        );
    });
});
