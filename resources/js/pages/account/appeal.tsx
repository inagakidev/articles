import { Form, Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';

type Props = {
    penaltyId: number;
    type: 'suspension' | 'ban';
    policyItem: string;
    deadline: string | null;
    alreadyAppealed: boolean;
    submitUrl: string;
};

export default function Appeal({ policyItem, deadline, alreadyAppealed, submitUrl }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('account.appeal.title')} />
            <main className="mx-auto max-w-xl px-6 py-16">
                <h1 className="font-display text-3xl font-extrabold">{t('account.appeal.title')}</h1>
                <p className="mt-3 text-text-secondary">{policyItem}</p>
                {alreadyAppealed ? (
                    <p className="mt-6 rounded-card border border-border bg-surface p-5">
                        {t('account.appeal.already')}
                    </p>
                ) : (
                    <Form action={submitUrl} method="post" className="mt-6 space-y-4">
                        <label className="block text-label font-bold" htmlFor="justification">
                            {t('moderation.appeals.justification')}
                        </label>
                        <textarea
                            id="justification"
                            name="justification"
                            minLength={20}
                            maxLength={5000}
                            required
                            className="min-h-40 w-full rounded-card border border-border bg-surface px-4 py-3"
                        />
                        <button
                            type="submit"
                            className="h-10 rounded-full bg-primary px-5 text-label font-bold text-text-on-primary"
                        >
                            {t('account.appeal.submit')}
                        </button>
                    </Form>
                )}
                {deadline && (
                    <p className="mt-4 text-meta text-text-secondary">
                        {new Date(deadline).toLocaleString()}
                    </p>
                )}
            </main>
        </>
    );
}
