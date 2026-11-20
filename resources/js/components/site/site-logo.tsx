import { Link, usePage } from '@inertiajs/react';
import Logo from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

export default function SiteLogo({
    height = 32,
    compactOnMobile = false,
    withTagline = false,
    className,
}: {
    height?: number;
    /** No celular, mostra só o ícone. */
    compactOnMobile?: boolean;
    /** Logo com a tagline "he4rt developers", para o rodapé. */
    withTagline?: boolean;
    className?: string;
}) {
    const { name } = usePage().props;
    const variant = withTagline ? 'wordmark-full' : 'wordmark';

    return (
        <Link
            href={home()}
            className={cn('flex items-center rounded-md', className)}
        >
            {compactOnMobile ? (
                <>
                    <Logo
                        variant="icon"
                        height={height}
                        className="sm:hidden"
                    />
                    <Logo
                        variant={variant}
                        height={height}
                        className="hidden sm:inline-flex"
                    />
                </>
            ) : (
                <Logo variant={variant} height={height} />
            )}
            <span className="sr-only">{name}</span>
        </Link>
    );
}
