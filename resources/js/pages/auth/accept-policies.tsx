import { Form, Head, Link } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import { AuthCardHeader } from '@/layouts/auth-layout';
import type { AuthLayoutProps } from '@/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-error';
import { Spinner } from '@/components/ui/spinner';
import TextLink from '@/components/ui/text-link';
import { formatDate } from '@/lib/format';
import { useTranslation } from '@/lib/i18n';
import { logout } from '@/routes';
import { privacy, terms } from '@/routes/policies';
import { store } from '@/routes/policies/acceptance';

type Pending = {
    type: 'terms' | 'privacy';
    version: string;
    publishedAt: string;
    changes: string[];
    /** A última versão que a pessoa aceitou deste documento. */
    previous: { version: string; acceptedAt: string } | null;
};

/**
 * Novo aceite quando os Termos ou a Privacidade mudam (RF-013, D73). Mostra o
 * que mudou em cada documento; um aceite vale para todos os pendentes.
 */
export default function AcceptPolicies({
    documents,
}: {
    documents: Pending[];
}) {
    const { t } = useTranslation();
    const only = documents.length === 1 ? documents[0] : null;
    const title = only
        ? t(
              only.type === 'terms'
                  ? 'policies.accept.title.terms'
                  : 'policies.accept.title.privacy',
          )
        : t('policies.accept.title.both');
    const checkbox = only
        ? t(
              only.type === 'terms'
                  ? 'policies.accept.checkbox.terms'
                  : 'policies.accept.checkbox.privacy',
              { version: only.version },
          )
        : t('policies.accept.checkbox.both');

    return (
        <>
            <Head title={title} />

            <AuthCardHeader
                art="lendo"
                title={title}
                description={t('policies.accept.description')}
            />

            {documents.map((document) => (
                <ChangesCard key={document.type} document={document} />
            ))}

            <Form
                {...store.form()}
                className="flex w-full flex-col gap-5 text-left"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="accepted"
                                className="flex cursor-pointer items-start gap-2.5 text-[0.9375rem]/[1.375rem]"
                            >
                                <input
                                    id="accepted"
                                    type="checkbox"
                                    name="accepted"
                                    value="1"
                                    required
                                    aria-invalid={
                                        errors.accepted ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.accepted
                                            ? 'accepted-error'
                                            : undefined
                                    }
                                    className="mt-px size-5 shrink-0 accent-primary"
                                />
                                <span>{checkbox}</span>
                            </label>
                            <InputError
                                id="accepted-error"
                                message={errors.accepted}
                            />
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <Button
                                type="submit"
                                size="xl"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                {t('policies.accept.submit')}
                            </Button>
                            <Button
                                asChild
                                variant="subtle"
                                size="md"
                                className="w-full"
                            >
                                <Link href={logout()} as="button">
                                    {t('policies.accept.logout')}
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

function ChangesCard({ document }: { document: Pending }) {
    const { t, locale } = useTranslation();
    const version = t('policies.accept.version_line', {
        version: document.version,
        date: formatDate(locale, document.publishedAt, 'medium'),
    });
    const previous = document.previous
        ? t('policies.accept.previous', {
              version: document.previous.version,
              date: formatDate(locale, document.previous.acceptedAt, 'medium'),
          })
        : null;

    return (
        <div className="flex w-full flex-col gap-3 rounded-lg bg-surface-muted px-5 py-[18px] text-left">
            <span className="text-caption font-bold text-text-secondary">
                {previous ? `${version} · ${previous}` : version}
            </span>
            <ul className="flex flex-col gap-2">
                {document.changes.map((change) => (
                    <li
                        key={change}
                        className="flex items-start gap-2.5 text-[0.9375rem]/[1.4375rem]"
                    >
                        <CircleCheck
                            aria-hidden="true"
                            className="mt-0.5 size-[18px] shrink-0 text-primary-text"
                        />
                        <span>{change}</span>
                    </li>
                ))}
            </ul>
            <TextLink
                href={document.type === 'terms' ? terms() : privacy()}
                className="self-start text-meta font-bold"
            >
                {t(
                    document.type === 'terms'
                        ? 'policies.accept.read.terms'
                        : 'policies.accept.read.privacy',
                )}
            </TextLink>
        </div>
    );
}

AcceptPolicies.layout = { variant: 'card' } satisfies AuthLayoutProps;
