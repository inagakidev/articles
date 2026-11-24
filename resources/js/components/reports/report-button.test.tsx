import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import '@/test/inertia';
import ReportButton from '@/components/reports/report-button';

const props = {
    target: 'article' as const,
    id: 3,
    subject: 'Artigo “Filas no Laravel”, de @rafa',
};

describe('denunciar', () => {
    it('não aparece para quem não pode denunciar', () => {
        const { container } = render(
            <ReportButton {...props} canReport={false} reported={false} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('abre o diálogo com os motivos; "Outro" pede detalhes', () => {
        render(<ReportButton {...props} canReport reported={false} iconOnly />);

        fireEvent.click(
            screen.getByRole('button', { name: 'Denunciar artigo' }),
        );

        expect(
            screen.getByRole('dialog', { name: 'Denunciar artigo' }),
        ).toHaveTextContent('Artigo “Filas no Laravel”, de @rafa');
        expect(screen.getAllByRole('radio')).toHaveLength(5);
        expect(
            screen.getByRole('button', { name: 'Enviar denúncia' }),
        ).toBeDisabled();

        fireEvent.click(screen.getByRole('radio', { name: /Outro/ }));
        expect(screen.getByLabelText(/Detalhes/)).toBeRequired();
        expect(
            screen.getByRole('button', { name: 'Enviar denúncia' }),
        ).toBeEnabled();
        expect(
            screen.getByText(/O conteúdo continua no ar até a análise/),
        ).toBeInTheDocument();
    });

    it('já denunciado, fica parado com o aviso', () => {
        render(<ReportButton {...props} canReport reported iconOnly />);

        expect(
            screen.getByRole('button', { name: 'Denúncia em análise' }),
        ).toBeDisabled();
    });
});
