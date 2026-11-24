import { Head, Link } from '@inertiajs/react';
import { House } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import { useTranslation } from '@/lib/i18n';
import { home } from '@/routes';
import { index as articles } from '@/routes/articles';

const ripples = [300, 390, 480];

/**
 * "Não achamos esta página" (prancha "Página não encontrada"), para endereço
 * que não existe e para artigo fora do ar. A busca entra com a fatia 13.
 */
export default function NotFound() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('not_found.title')} />
            <section className="mx-auto flex w-full max-w-250 flex-wrap items-center justify-center gap-x-14 gap-y-6 overflow-hidden px-4 pt-12 pb-24 sm:px-8">
                <div className="relative flex items-center justify-center p-6">
                    {ripples.map((size, index) => (
                        <span
                            key={size}
                            aria-hidden="true"
                            className="ripple max-sm:hidden"
                            style={{
                                width: size,
                                height: size,
                                animationDelay: `${index * 0.7}s`,
                            }}
                        />
                    ))}
                    <Mascot
                        art="procurando"
                        size={280}
                        float
                        className="relative max-w-[60vw]"
                    />
                </div>
                <div className="flex flex-[0_1_460px] flex-col items-start gap-4.5">
                    <h1 className="font-display text-[2.25rem]/11 font-extrabold tracking-[-0.02em]">
                        {t('not_found.title')}
                    </h1>
                    <p className="text-[1.0625rem]/[1.625rem] text-text-secondary">
                        {t('not_found.text')}
                    </p>
                    <div className="flex w-full flex-wrap gap-2.5">
                        <Button asChild size="md">
                            <Link href={home()}>
                                <House aria-hidden="true" />
                                {t('not_found.home')}
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="md"
                            variant="secondary"
                            className="border border-pastel-lavender dark:border-border"
                        >
                            <Link href={`${articles().url}#categorias`}>
                                {t('not_found.categories')}
                            </Link>
                        </Button>
                    </div>
                    <span className="text-caption text-text-secondary">
                        {t('not_found.code')}
                    </span>
                </div>
            </section>
        </>
    );
}
