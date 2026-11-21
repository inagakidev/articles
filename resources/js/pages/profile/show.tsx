import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, FileText, PenLine } from 'lucide-react';
import ArticleCard from '@/components/articles/article-card';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { edit } from '@/routes/profile';
import type { ArticleSummary } from '@/types';

type Props = {
    profile: {
        name: string;
        username: string;
        bio: string | null;
        avatar: string | null;
        /** AAAA-MM-DD */
        memberSince: string;
    };
    /** Chegam com a leitura pública (fatia 14). */
    articles: ArticleSummary[];
    articleCount: number;
};

/** Perfil público em /@username (prancha "Perfil do autor", RF-025, D77). */
export default function ProfileShow({
    profile,
    articles,
    articleCount,
}: Props) {
    const { auth } = usePage().props;
    const { t, locale } = useTranslation();
    const own = auth.user?.username === profile.username;
    const since = new Intl.DateTimeFormat(locale.replace('_', '-'), {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${profile.memberSince}T00:00:00Z`));

    return (
        <>
            <Head title={`${profile.name} (@${profile.username})`} />

            <div className="mx-auto flex w-full max-w-page flex-col gap-10 px-4 pt-8 pb-24 sm:px-8">
                <section className="relative animate-rise overflow-hidden rounded-section bg-surface-muted px-6 py-8 sm:px-12 sm:py-10">
                    <div
                        aria-hidden="true"
                        className="dot-grid absolute inset-0"
                    />
                    <div className="relative flex flex-wrap items-center gap-8">
                        <UserAvatar
                            name={profile.name}
                            avatar={profile.avatar}
                            className="size-32 text-[2.625rem] ring-4 ring-surface"
                        />
                        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2">
                            <h1 className="font-display text-[2.25rem]/11 font-extrabold tracking-[-0.02em] break-words">
                                {profile.name}
                            </h1>
                            <span className="font-bold text-text-secondary">
                                @{profile.username}
                            </span>
                            {profile.bio && (
                                <p className="mt-1 max-w-155 text-body leading-[1.625rem] whitespace-pre-line">
                                    {profile.bio}
                                </p>
                            )}
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-meta font-semibold text-text-secondary">
                                <span className="inline-flex items-center gap-1.5">
                                    <FileText
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    {articleCount === 1
                                        ? t('profile.articles_count_one')
                                        : t('profile.articles_count', {
                                              count: articleCount,
                                          })}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarDays
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    {t('profile.member_since', { date: since })}
                                </span>
                            </div>
                        </div>
                        {own && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="self-start"
                            >
                                <Link href={edit()}>
                                    <PenLine aria-hidden="true" />
                                    {t('profile.edit')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </section>

                <section
                    aria-labelledby="published-title"
                    className="flex flex-col gap-5"
                >
                    <h2
                        id="published-title"
                        className="font-display text-[1.625rem] font-extrabold"
                    >
                        {t('profile.articles.title')}
                    </h2>
                    {articles.length > 0 ? (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {articles.map((article) => (
                                <ArticleCard
                                    key={article.url}
                                    article={article}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
                            <Mascot
                                art={own ? 'escrevendo' : 'esperando'}
                                size={140}
                                float
                                grounded
                            />
                            <p className="font-display text-h3 font-extrabold">
                                {t('profile.empty.title')}
                            </p>
                            <p className="max-w-110 text-body text-text-secondary">
                                {own
                                    ? t('profile.empty.own')
                                    : t('profile.empty.text', {
                                          name: profile.name.split(' ')[0],
                                      })}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
