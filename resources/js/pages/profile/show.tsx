import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, FileText, PenLine } from 'lucide-react';
import ArticleCard from '@/components/articles/article-card';
import ReportButton from '@/components/reports/report-button';
import ShareButton from '@/components/share/share-button';
import { Button } from '@/components/ui/button';
import Mascot from '@/components/ui/mascot';
import Pagination from '@/components/ui/pagination';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { edit } from '@/routes/profile';
import { show } from '@/routes/profiles';
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
    /** Denunciar o perfil (RF-164): quem pode e se já denunciou. */
    report: { id: number; canReport: boolean; reported: boolean };
    /** Os artigos visíveis da pessoa, por página (p5-06). */
    articles: {
        data: ArticleSummary[];
        currentPage: number;
        lastPage: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    order: 'recentes' | 'antigos';
};

/** Endereço do perfil com a ordem e a página, sem o que for padrão. */
function profileUrl(username: string, order: string, page = 1): string {
    const query: Record<string, string | number> = {};

    if (order === 'antigos') query.ordem = order;
    if (page > 1) query.page = page;

    return show({ username }, { query }).url;
}

/**
 * Perfil público em /@username (prancha "Perfil do autor", RF-025, D77):
 * quem é, os artigos publicados e "Compartilhar perfil" (RF-163).
 */
export default function ProfileShow({
    profile,
    articles,
    order,
    report,
}: Props) {
    const articleCount = articles.total;
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
                        <div className="flex gap-2 self-start">
                            <ShareButton
                                label={t('share.profile_action')}
                                title={t('share.profile_title')}
                                linkLabel={t('share.profile_link')}
                                text={profile.name}
                                path={show({ username: profile.username }).url}
                                size="sm"
                            />
                            <ReportButton
                                target="profile"
                                id={report.id}
                                subject={t('reports.subject.profile', {
                                    username: profile.username,
                                })}
                                canReport={report.canReport}
                                reported={report.reported}
                            />
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
                    </div>
                </section>

                <section
                    aria-labelledby="published-title"
                    className="flex flex-col gap-5"
                >
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h2
                            id="published-title"
                            className="font-display text-[1.625rem] font-extrabold"
                        >
                            {t('profile.articles.title')}
                        </h2>
                        {articleCount > 1 && (
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="perfil-ordem"
                                    className="text-caption font-bold"
                                >
                                    {t('search.sort.label')}
                                </label>
                                <select
                                    id="perfil-ordem"
                                    value={order}
                                    onChange={(event) =>
                                        router.get(
                                            profileUrl(
                                                profile.username,
                                                event.target.value,
                                            ),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                    className="h-11 min-w-50 rounded-xl border border-border-strong bg-surface px-3 text-[0.9375rem] focus-visible:outline-offset-[-1px]"
                                >
                                    <option value="recentes">
                                        {t('search.sort.recent')}
                                    </option>
                                    <option value="antigos">
                                        {t('search.sort.oldest')}
                                    </option>
                                </select>
                            </div>
                        )}
                    </div>
                    {articleCount > 0 ? (
                        <>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
                                {articles.data.map((article) => (
                                    <ArticleCard
                                        key={article.url}
                                        article={article}
                                    />
                                ))}
                            </div>
                            {articles.lastPage > 1 && (
                                <p
                                    role="status"
                                    className="-mb-2 text-center text-meta text-text-secondary"
                                >
                                    {t('listing.showing', {
                                        first: articles.from ?? 0,
                                        last: articles.to ?? 0,
                                        count: articles.total,
                                    })}
                                </p>
                            )}
                            <Pagination
                                current={articles.currentPage}
                                last={articles.lastPage}
                                href={(page) =>
                                    profileUrl(profile.username, order, page)
                                }
                            />
                        </>
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
