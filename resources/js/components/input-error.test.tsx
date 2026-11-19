import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import InputError from '@/components/input-error';

describe('InputError', () => {
    it('renders the message', () => {
        render(<InputError message="The email field is required." />);

        expect(
            screen.getByText('The email field is required.'),
        ).toBeInTheDocument();
    });

    it('renders nothing without a message', () => {
        const { container } = render(<InputError />);

        expect(container).toBeEmptyDOMElement();
    });
});
