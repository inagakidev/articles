import type { Editor } from '@tiptap/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';

/** Só http, https e mailto, como o servidor (`DocumentSanitizer::safeHref`). */
const SAFE_HREF = /^(https?:\/\/\S+|mailto:[^\s@]+@[^\s@]+)$/i;

/** Pôr, trocar ou tirar o link do trecho selecionado. */
export default function LinkDialog({
    editor,
    open,
    onOpenChange,
}: {
    editor: Editor;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const current =
        (editor.getAttributes('link').href as string | undefined) ?? '';
    const [href, setHref] = useState(current);
    const [error, setError] = useState<string | undefined>();

    function apply(event: FormEvent) {
        event.preventDefault();
        const value =
            /^[\w.-]+\.[a-z]{2,}/i.test(href) && !href.includes(':')
                ? `https://${href}`
                : href.trim();

        if (!SAFE_HREF.test(value)) {
            setError(t('editor.link.invalid'));

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: value })
            .run();
        onOpenChange(false);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (next) {
                    setHref(current);
                    setError(undefined);
                }

                onOpenChange(next);
            }}
        >
            <DialogContent>
                <DialogTitle className="font-display text-[1.25rem] font-extrabold">
                    {t('editor.link.title')}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    {t('editor.link.hint')}
                </DialogDescription>
                <form onSubmit={apply} className="flex flex-col gap-4">
                    <FormField
                        id="link-href"
                        label={t('editor.link.label')}
                        hint={t('editor.link.hint')}
                        error={error}
                    >
                        {(field) => (
                            <Input
                                {...field}
                                type="text"
                                inputMode="url"
                                value={href}
                                onChange={(event) =>
                                    setHref(event.target.value)
                                }
                                placeholder="https://"
                                autoFocus
                            />
                        )}
                    </FormField>
                    <div className="flex flex-wrap justify-end gap-2">
                        {current && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="md"
                                className="mr-auto"
                                onClick={() => {
                                    editor
                                        .chain()
                                        .focus()
                                        .extendMarkRange('link')
                                        .unsetLink()
                                        .run();
                                    onOpenChange(false);
                                }}
                            >
                                {t('editor.link.remove')}
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="md"
                            onClick={() => onOpenChange(false)}
                        >
                            {t('editor.link.cancel')}
                        </Button>
                        <Button type="submit" size="md">
                            {t('editor.link.save')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
