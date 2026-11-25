import { Flag } from 'lucide-react';
import { useState } from 'react';
import ReportDialog from '@/components/reports/report-dialog';
import type { ReportTarget } from '@/components/reports/report-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

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
    reported,
    iconOnly = false,
    className,
}: {
    target: ReportTarget;
    id: number;
    subject: string;
    canReport: boolean;
    reported: boolean;
    /** Só o ícone, como as outras ações da leitura (D88). */
    iconOnly?: boolean;
    className?: string;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    if (!canReport) {
        return null;
    }

    const label = reported
        ? t('reports.already')
        : t(`reports.action.${target}`);

    return (
        <>
            {iconOnly ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                aria-label={label}
                                disabled={reported}
                                onClick={() => setOpen(true)}
                                className={cn(
                                    'size-10 gap-0 rounded-full p-0 text-text-secondary transition-colors outline-none hover:bg-surface-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-surface-selected has-[>svg]:px-0 [&_svg]:size-5',
                                    className,
                                )}
                            >
                                <Flag aria-hidden="true" className="size-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">{label}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={reported}
                    onClick={() => setOpen(true)}
                    className={className}
                >
                    <Flag aria-hidden="true" />
                    {label}
                </Button>
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
