import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Mascote, { artesDoMascote, urlsDoMascote } from '@/components/mascote';

describe('Mascote', () => {
    it('tem um arquivo para cada arte e uma arte para cada arquivo', () => {
        expect(Object.keys(urlsDoMascote).sort()).toEqual(
            [...artesDoMascote].sort(),
        );
    });

    it('é sempre decorativo', () => {
        const { container } = render(
            <Mascote arte="pose-acenando" tamanho={200} />,
        );
        const img = container.querySelector('img')!;

        expect(img).toHaveAttribute('alt', '');
        expect(img).toHaveAttribute('aria-hidden', 'true');
    });

    it('mostra a arte pedida a partir de 96 px', () => {
        const { container } = render(<Mascote arte="pose-lupa" tamanho={96} />);

        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            urlsDoMascote['pose-lupa'],
        );
    });

    it('usa o avatar entre 24 e 96 px', () => {
        const { container } = render(<Mascote arte="pose-lupa" tamanho={64} />);

        expect(container.querySelector('img')).toHaveAttribute(
            'src',
            urlsDoMascote['mascote-avatar'],
        );
    });

    it('usa só o marcador abaixo de 24 px', () => {
        const { container } = render(<Mascote arte="pose-lupa" tamanho={20} />);

        expect(container.querySelector('img')).toBeNull();
        expect(container.querySelector('svg')).toHaveAttribute(
            'aria-hidden',
            'true',
        );
    });
});
