import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vite-plus/test';
import { testPage } from '@/test/inertia';
import AcceptPolicies from '@/pages/auth/accept-policies';

const terms = {
    type: 'terms' as const,
    version: '2.0',
    publishedAt: '2026-11-20',
    changes: ['Seção 3: regras de uso de imagens enviadas nos artigos.'],
    previous: { version: '1.0', acceptedAt: '2026-03-02' },
};

describe('novo aceite', () => {
    it('mostra o que mudou, a versão aceita antes e pede o aceite', () => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
        render(<AcceptPolicies documents={[terms]} />);

        expect(
            screen.getByRole('heading', {
                name: 'Atualizamos os Termos de uso',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/você aceitou a versão 1.0/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Seção 3: regras de uso de imagens enviadas nos artigos.',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                'Li e aceito a versão 2.0 dos Termos de uso.',
            ),
        ).toBeRequired();
        // Na aplicação é um botão (Link as="button"); a simulação do Inertia usa <a>.
        expect(screen.getByText('Sair da conta')).toBeInTheDocument();
    });

    it('com os dois documentos, um único aceite cobre os dois', () => {
        Object.assign(testPage.props, { locale: 'pt_BR' });
        render(
            <AcceptPolicies
                documents={[
                    terms,
                    { ...terms, type: 'privacy', previous: null },
                ]}
            />,
        );

        expect(
            screen.getByLabelText(
                'Li e aceito as novas versões dos Termos de uso e da Política de privacidade.',
            ),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('checkbox')).toHaveLength(1);
    });
});
