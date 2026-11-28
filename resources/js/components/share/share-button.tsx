import { Share2 } from 'lucide-react';
import { useState } from 'react';
import ShareDialog from '@/components/share/share-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Botão "Compartilhar" que abre o diálogo com o endereço desta página. O
 * endereço vem do navegador na hora, para valer em qualquer domínio.
 */
export default function ShareButton({
    label,
    title,
    linkLabel,
    text,
    path,
    variant = 'outline',
    size = 'md',
    iconOnly = false,
    className,
}: {
    label: string;
    title: string;
    linkLabel: string;
    text: string;
    /** Caminho a compartilhar; sem ele, a página atual sem a âncora. */
    path?: string;
    variant?: VariantProps<typeof buttonVariants>['variant'];
    size?: VariantProps<typeof buttonVariants>['size'];
    /** Só o ícone, com o nome para leitores de tela e na dica. */
    iconOnly?: boolean;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');

    function share() {
        const { origin, pathname, search } = window.location;
        setUrl(`${origin}${path ?? `${pathname}${search}`}`);
        setOpen(true);
    }

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
                                onClick={share}
                                className={cn(
                                    'size-10 gap-0 rounded-full p-0 text-text-secondary transition-colors outline-none hover:bg-surface-hover hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-surface-selected has-[>svg]:px-0 [&_svg]:size-5',
                                    className,
                                )}
                            >
                                <Share2 aria-hidden="true" className="size-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">{label}</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                <Button
                    type="button"
                    variant={variant}
                    size={size}
                    onClick={share}
                    className={className}
                >
                    <Share2 aria-hidden="true" className="size-6" />
                    {label}
                </Button>
            )}
            <ShareDialog
                open={open}
                onOpenChange={setOpen}
                title={title}
                linkLabel={linkLabel}
                url={url}
                text={text}
            />
        </>
    );
}
