import { Check, Copy, Mail, Share2 } from 'lucide-react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useEffect, useState } from 'react';
import {
    FacebookIcon,
    LinkedInIcon,
    WhatsAppIcon,
    XIcon,
} from '@/components/share/brand-icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type Target = {
    label: string;
    href: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    tone: string;
};

/** Os endereços de compartilhar de cada rede (RF-163). */
export function shareTargets(url: string, text: string): Target[] {
    const link = encodeURIComponent(url);
    const message = encodeURIComponent(text);

    return [
        {
            label: 'WhatsApp',
            href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
            Icon: WhatsAppIcon,
            tone: 'bg-pastel-mint text-pastel-mint-fg',
        },
        {
            label: 'LinkedIn',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
            Icon: LinkedInIcon,
            tone: 'bg-pastel-blue text-pastel-blue-fg',
        },
        {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
            Icon: FacebookIcon,
            tone: 'bg-pastel-blue text-pastel-blue-fg',
        },
        {
            label: 'X',
            href: `https://x.com/intent/post?text=${message}&url=${link}`,
            Icon: XIcon,
            tone: 'bg-surface-muted text-text-primary',
        },
        {
            label: 'E-mail',
            href: `mailto:?subject=${message}&body=${link}`,
            Icon: Mail,
            tone: 'bg-pastel-yellow text-pastel-yellow-fg',
        },
    ];
}

/**
 * Compartilhar (prancha "Compartilhar artigo", RF-163): WhatsApp, LinkedIn,
 * Facebook, X, e-mail, as outras redes do aparelho (quando ele oferece) e
 * copiar o link. No celular, sobe de baixo; no desktop, é um diálogo.
 */
export default function ShareDialog({
    open,
    onOpenChange,
    title,
    linkLabel,
    url,
    text,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** "Compartilhar artigo", "Compartilhar perfil". */
    title: string;
    /** Rótulo do campo do link, para o leitor de tela. */
    linkLabel: string;
    url: string;
    /** O que acompanha o link (o título do artigo, o nome da pessoa). */
    text: string;
}) {
    const [desktop, setDesktop] = useState(true);

    useEffect(() => {
        if (open) {
            setDesktop(
                window.matchMedia?.('(min-width: 768px)').matches ?? true,
            );
        }
    }, [open]);

    const body = <ShareBody url={url} text={text} linkLabel={linkLabel} />;

    if (!desktop) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="bottom"
                    className="gap-4 rounded-t-section p-5"
                >
                    <SheetTitle className="font-display text-h3 font-extrabold">
                        {title}
                    </SheetTitle>
                    {body}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-130 gap-4 rounded-3xl p-6.5">
                <DialogTitle className="font-display text-[1.375rem]/[1.875rem] font-extrabold">
                    {title}
                </DialogTitle>
                {body}
            </DialogContent>
        </Dialog>
    );
}

function ShareBody({
    url,
    text,
    linkLabel,
}: {
    url: string;
    text: string;
    linkLabel: string;
}) {
    const { t } = useTranslation();
    const [copied, copy] = useClipboard();
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        setCanShare(typeof navigator.share === 'function');
    }, []);

    return (
        <>
            <ul className="grid grid-cols-5 gap-1">
                {shareTargets(url, text).map(({ label, href, Icon, tone }) => (
                    <li key={label}>
                        <TargetLink href={href} tone={tone} label={label}>
                            <Icon className="size-6" />
                        </TargetLink>
                    </li>
                ))}
            </ul>

            {canShare && (
                <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                        navigator.share({ url, title: text }).catch(() => {
                            // Fechou a escolha do aparelho: nada a fazer
                        });
                    }}
                >
                    <Share2 aria-hidden="true" className="size-6" />
                    {t('share.more')}
                </Button>
            )}

            <div className="flex items-center gap-2">
                <label htmlFor="link-compartilhar" className="sr-only">
                    {linkLabel}
                </label>
                <input
                    id="link-compartilhar"
                    readOnly
                    value={url}
                    onFocus={(event) => event.target.select()}
                    className="h-12 w-full min-w-0 rounded-xl border border-border-strong bg-surface-muted px-3.5 text-[0.9375rem] text-text-primary focus-visible:outline-offset-[-1px]"
                />
                <Button
                    type="button"
                    size="lg"
                    className="h-12 shrink-0 rounded-xl"
                    onClick={() => void copy(url)}
                >
                    {copied === url ? (
                        <Check aria-hidden="true" />
                    ) : (
                        <Copy aria-hidden="true" />
                    )}
                    {copied === url ? t('share.copied') : t('share.copy')}
                </Button>
            </div>
            <span
                role="status"
                className="min-h-5 text-caption text-text-secondary"
            >
                {copied === url ? t('share.copied_hint') : ''}
            </span>
        </>
    );
}

function TargetLink({
    href,
    tone,
    label,
    children,
}: {
    href: string;
    tone: string;
    label: string;
    children: ReactNode;
}) {
    const external = !href.startsWith('mailto:');

    return (
        <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="flex flex-col items-center gap-2 rounded-2xl px-1 py-2.5 text-caption font-bold hover:bg-surface-hover"
        >
            <span
                aria-hidden="true"
                className={cn(
                    'inline-flex size-13 items-center justify-center rounded-2xl',
                    tone,
                )}
            >
                {children}
            </span>
            {label}
        </a>
    );
}
