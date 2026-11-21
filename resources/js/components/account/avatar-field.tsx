import { router } from '@inertiajs/react';
import { Camera, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-error';
import { Spinner } from '@/components/ui/spinner';
import UserAvatar from '@/components/ui/user-avatar';
import { useTranslation } from '@/lib/i18n';
import { destroy, update } from '@/routes/avatar';

/**
 * Foto de perfil (RF-026, RF-032, RF-033): escolher já envia, com a prévia
 * enquanto o servidor tira os metadados e recorta (D52). "Remover" volta
 * às iniciais.
 */
export default function AvatarField({
    name,
    avatar,
}: {
    name: string;
    avatar: string | null;
}) {
    const { t } = useTranslation();
    const input = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(
        () => () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        },
        [preview],
    );

    function choose(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        setError(undefined);
        setPreview(URL.createObjectURL(file));
        router.post(
            update().url,
            { avatar: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setBusy(true),
                onError: (errors) => setError(errors.avatar),
                onFinish: () => {
                    setBusy(false);
                    setPreview(null);
                },
            },
        );
    }

    function remove() {
        router.delete(destroy().url, {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-5">
                <div className="relative">
                    <UserAvatar
                        name={name}
                        avatar={preview ?? avatar}
                        className="size-22 text-[1.875rem]"
                    />
                    {busy && (
                        <span className="absolute inset-0 inline-flex items-center justify-center rounded-full bg-bg/60">
                            <Spinner />
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                        <input
                            ref={input}
                            id="avatar"
                            type="file"
                            name="avatar"
                            accept="image/jpeg,image/png,image/webp"
                            // Escondido: quem abre a escolha é o botão ao lado.
                            hidden
                            tabIndex={-1}
                            onChange={choose}
                            disabled={busy}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => input.current?.click()}
                            disabled={busy}
                            aria-describedby={
                                error
                                    ? 'avatar-hint avatar-error'
                                    : 'avatar-hint'
                            }
                        >
                            <Camera aria-hidden="true" />
                            {t(
                                avatar
                                    ? 'settings.avatar.change'
                                    : 'settings.avatar.add',
                            )}
                        </Button>
                        {avatar && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={remove}
                                disabled={busy}
                            >
                                <Trash2 aria-hidden="true" />
                                {t('settings.avatar.remove')}
                            </Button>
                        )}
                    </div>
                    <span
                        id="avatar-hint"
                        className="text-caption text-text-secondary"
                    >
                        {busy
                            ? t('settings.avatar.uploading')
                            : t('settings.avatar.hint')}
                    </span>
                </div>
            </div>
            <InputError id="avatar-error" message={error} />
        </div>
    );
}
