import type { ReactElement } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Dica com o nome de uma ação que é só ícone (curtir, favoritar,
 * comentários, denunciar). O provedor fica aqui, num lugar só, para o
 * componente funcionar em qualquer página e nos testes.
 */
export default function ActionTip({
    label,
    children,
}: {
    label: string;
    children: ReactElement;
}) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent side="left">{label}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
