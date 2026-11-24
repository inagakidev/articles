import { Share2 } from 'lucide-react';
import { useState } from 'react';
import ShareDialog from '@/components/share/share-dialog';
import { Button } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import type { buttonVariants } from '@/components/ui/button';

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
            <Button
                type="button"
                variant={variant}
                size={size}
                onClick={share}
                className={className}
            >
                <Share2 aria-hidden="true" />
                {label}
            </Button>
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
