import { Flag } from 'lucide-react';
import { useState } from 'react';
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
            <Button
                type="button"
                variant={iconOnly ? 'ghost' : 'outline'}
                size={iconOnly ? undefined : 'sm'}
                aria-label={iconOnly ? label : undefined}
                title={label}
                disabled={reported}
                onClick={() => setOpen(true)}
                className={cn(
                    iconOnly &&
                        'size-10 rounded-full px-0 text-text-secondary hover:text-text-primary [&_svg]:size-5',
                    className,
                )}
            >
                <Flag aria-hidden="true" />
                {!iconOnly && label}
            </Button>
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
