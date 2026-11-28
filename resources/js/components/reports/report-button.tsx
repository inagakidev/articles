import { Flag } from 'lucide-react';
import { useState } from 'react';
import ActionTip from '@/components/interactions/action-tip';
import SignInPrompt from '@/components/interactions/sign-in-prompt';
import ReportDialog from '@/components/reports/report-dialog';
import type { ReportTarget } from '@/components/reports/report-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Denunciar um artigo ou perfil (RF-164). Já denunciado e em análise, o
 * botão fica parado com o aviso (RF-167). Quem não pode denunciar não vê
 * nada (RF-141).
 */
export default function ReportButton({
    target,
    id,
    subject,
    canReport,
    guest = false,
    reported,
    iconOnly = false,
    className,
}: {
    target: ReportTarget;
    id: number;
    subject: string;
    canReport: boolean;
    /** Sem conta: o clique abre o convite para entrar (D94). */
    guest?: boolean;
    reported: boolean;
    /** Só o ícone, como as outras ações da leitura (D88). */
    iconOnly?: boolean;
    className?: string;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState(false);

    if (!canReport && !guest) {
        return null;
    }

    // Quem visita é convidada a entrar antes de denunciar (D94)
    const start = () => (guest ? setPrompt(true) : setOpen(true));

    const label = reported
        ? t('reports.already')
        : t(`reports.action.${target}`);

    return (
        <>
            {iconOnly ? (
                <ActionTip label={label}>
                    <Button
                        type="button"
                        variant="ghost"
                        aria-label={label}
                        disabled={reported}
                        onClick={start}
                        className={cn(
                            'size-10 gap-0 rounded-full p-0 text-text-secondary transition-colors outline-none hover:bg-surface-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-surface-selected has-[>svg]:px-0 [&_svg]:size-5',
                            className,
                        )}
                    >
                        <Flag aria-hidden="true" className="size-5" />
                    </Button>
                </ActionTip>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={reported}
                    onClick={start}
                    className={className}
                >
                    <Flag aria-hidden="true" />
                    {label}
                </Button>
            )}
            {guest && (
                <SignInPrompt
                    action="report"
                    open={prompt}
                    onClose={() => setPrompt(false)}
                />
            )}
            <ReportDialog
                open={open}
                onClose={() => setOpen(false)}
                target={target}
                id={id}
                subject={subject}
            />
        </>
    );
}
