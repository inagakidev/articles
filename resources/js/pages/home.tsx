import { Head } from '@inertiajs/react';
import Audience from '@/components/landing/audience';
import Community from '@/components/landing/community';
import type { CommunityAuthors } from '@/components/landing/community';
import Faq from '@/components/landing/faq';
import Features from '@/components/landing/features';
import FinalCta from '@/components/landing/final-cta';
import Hero from '@/components/landing/hero';
import HowItWorks from '@/components/landing/how-it-works';
import { useTranslation } from '@/lib/i18n';
import type { ArticleSummary, CategorySummary } from '@/types';

/** Página de apresentação (RF-379 a RF-383, D74). */
export default function Home({
    categories,
    recentArticles,
    authors,
}: {
    categories: CategorySummary[];
    recentArticles: ArticleSummary[];
    authors: CommunityAuthors;
}) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('home.title')} />
            <Hero categories={categories} />
            <HowItWorks />
            <Features />
            <Audience />
            <Community articles={recentArticles} authors={authors} />
            <Faq />
            <FinalCta />
        </>
    );
}
