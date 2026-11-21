import { render } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import UserAvatar, { toneFor } from '@/components/ui/user-avatar';

describe('avatar da pessoa', () => {
    it('mostra a foto em círculo, sem texto alternativo (o nome está por perto)', () => {
        const { container } = render(
            <UserAvatar name="Lia Martins" avatar="/media/avatars/x.webp" />,
        );
        const img = container.querySelector('img')!;

        expect(img).toHaveAttribute('src', '/media/avatars/x.webp');
        expect(img).toHaveAttribute('alt', '');
        expect(img).toHaveClass('rounded-full');
    });

    it('sem foto, mostra as iniciais num pastel que é sempre o mesmo para a pessoa', () => {
        const { container } = render(<UserAvatar name="Lia Martins" />);

        expect(container.firstElementChild).toHaveTextContent('LM');
        expect(toneFor('Lia Martins')).toBe(toneFor('Lia Martins'));
        expect(
            new Set(['Ana', 'Bia', 'Caio', 'Davi', 'Eva', 'Fábio'].map(toneFor))
                .size,
        ).toBeGreaterThan(1);
    });
});
