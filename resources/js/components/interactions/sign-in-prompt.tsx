import { Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import { login, register } from '@/routes';

export type PromptAction = 'like' | 'favorite' | 'comment' | 'report';

/**
 * Convite para quem visita participar (D94): entrar ou criar conta, e
 * depois voltar para a mesma página (`redirect`), em vez de cair na
 * página inicial.
 */
export default function SignInPrompt({
    action,
    open,
    onClose,
}: {
    action: PromptAction;
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const { url } = usePage();
    const query = { redirect: url };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="rounded-card sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-h3 font-extrabold">
                        {t(`signin_prompt.${action}`)}
                    </DialogTitle>
                    <DialogDescription>
                        {t('signin_prompt.text')}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                        asChild
                        variant="outline"
                        size="md"
                        className="w-full sm:w-auto"
                    >
                        <Link href={register({ query })}>
                            {t('account.login.create_account')}
                        </Link>
                    </Button>
                    <Button asChild size="md" className="w-full sm:w-auto">
                        <Link href={login({ query })}>
                            {t('account.login.submit')}
                        </Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
