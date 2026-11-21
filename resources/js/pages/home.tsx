import { Head } from '@inertiajs/react';
import Audience from '@/components/blocks/audience';
import Community from '@/components/blocks/community';
import type { CommunityAuthors } from '@/components/blocks/community';
import Faq from '@/components/blocks/faq';
import Features from '@/components/blocks/features';
import FinalCta from '@/components/blocks/final-cta';
import Hero from '@/components/blocks/hero';
import HowItWorks from '@/components/blocks/how-it-works';
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
