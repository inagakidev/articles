import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import MotionToggle from '@/components/ui/motion-toggle';
import {
    MOTION_PAUSED_CLASS,
    MOTION_STORAGE_KEY,
} from '@/hooks/use-motion-pause';

describe('botão de pausar animações', () => {
    afterEach(() => {
        document.documentElement.classList.remove(MOTION_PAUSED_CLASS);
        localStorage.clear();
    });

    it('pausa e retoma as animações do site e guarda a escolha', () => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
        render(<MotionToggle />);

        fireEvent.click(screen.getByRole('button', { name: 'Pausar animações' }));

        expect(document.documentElement).toHaveClass(MOTION_PAUSED_CLASS);
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe('paused');

        fireEvent.click(screen.getByRole('button', { name: 'Retomar animações' }));

        expect(document.documentElement).not.toHaveClass(MOTION_PAUSED_CLASS);
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBeNull();
    });

    it('começa pausado quando a página já carregou com a escolha salva', () => {
        Object.assign(testPage.props, { locale: 'en' });
        document.documentElement.classList.add(MOTION_PAUSED_CLASS);

        render(<MotionToggle />);

        expect(
            screen.getByRole('button', { name: 'Resume animations' }),
        ).toBeInTheDocument();
    });

    it('todos os botões da página mudam juntos', () => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
        render(
            <>
                <MotionToggle />
                <MotionToggle />
            </>,
        );

        fireEvent.click(
            screen.getAllByRole('button', { name: 'Pausar animações' })[0],
        );

        expect(
            screen.getAllByRole('button', { name: 'Retomar animações' }),
        ).toHaveLength(2);
    });

    it('na versão só com ícone, o nome acessível diz o que o botão faz', () => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
        render(<MotionToggle variant="icon" />);

        fireEvent.click(screen.getByRole('button', { name: 'Pausar animações' }));

        expect(
            screen.getByRole('button', { name: 'Retomar animações' }),
        ).toBeInTheDocument();
    });
});
