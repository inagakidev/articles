import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';

export default function Welcome() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('home.title')} />
            <section className="mx-auto flex w-full max-w-page flex-1 flex-col justify-center px-4 py-16 sm:px-8">
                <h1 className="max-w-2xl text-h1 font-extrabold sm:text-display">
                    {t('home.headline')}
                </h1>
                <p className="mt-4 max-w-xl text-article text-text-secondary">
                    {t('home.tagline')}
                </p>
            </section>
        </>
    );
}
