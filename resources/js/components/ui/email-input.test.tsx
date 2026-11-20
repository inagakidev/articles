import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import EmailInput from '@/components/ui/email-input';

function renderInput() {
    Object.assign(testPage.props, { locale: 'pt_BR' });
    render(<EmailInput aria-label="E-mail" name="email" />);

    return screen.getByLabelText('E-mail') as HTMLInputElement;
}

describe('campo de e-mail', () => {
    it('não aceita e-mail sem o domínio completo e explica o formato', () => {
        const input = renderInput();

        fireEvent.change(input, { target: { value: 'gabislis233@gmail' } });

        expect(input.checkValidity()).toBe(false);
        expect(input.validationMessage).toBe(
            'Digite um e-mail completo, como voce@exemplo.dev.',
        );
    });

    it('aceita e-mail com domínio completo', () => {
        const input = renderInput();

        fireEvent.change(input, { target: { value: 'gabislis233@gmail.com' } });

        expect(input.checkValidity()).toBe(true);
    });
});
