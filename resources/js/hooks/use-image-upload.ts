import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';
import { xsrfToken } from '@/lib/xsrf';
import { store as storeImage } from '@/routes/articles/images';

export type UploadedImage = {
    id: string;
    src: string;
    width: number;
    height: number;
};

/** Os formatos aceitos (RF-085); SVG e GIF ficam de fora. */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

/**
 * Envia uma imagem para o artigo (RF-082). O artigo novo é criado antes,
 * porque a imagem pertence a ele. O servidor confere tudo de novo; aqui a
 * conferência só evita esperar um envio que seria recusado.
 */
export function useImageUpload({
    ensureArticle,
    maxMegabytes,
}: {
    ensureArticle: () => Promise<number | null>;
    maxMegabytes: number;
}) {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);

    const upload = useCallback(
        async (file: File): Promise<UploadedImage | null> => {
            if (!IMAGE_ACCEPT.split(',').includes(file.type)) {
                toast.error(t('editor.image.wrong_type'));

                return null;
            }

            if (file.size > maxMegabytes * 1024 * 1024) {
                toast.error(t('editor.image.too_big', { max: maxMegabytes }));

                return null;
            }

            setUploading(true);

            try {
                const id = await ensureArticle();

                if (id === null) {
                    throw new Error('article');
                }

                const body = new FormData();
                body.append('image', file);
                const target = storeImage(id);
                const response = await fetch(target.url, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': xsrfToken(),
                    },
                    body,
                });
                const json = (await response.json().catch(() => ({}))) as
                    | UploadedImage
                    | { errors?: Record<string, string[]> };

                if (response.status === 422 && 'errors' in json) {
                    toast.error(
                        Object.values(json.errors ?? {})[0]?.[0] ??
                            t('editor.image.failed'),
                    );

                    return null;
                }

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return json as UploadedImage;
            } catch {
                toast.error(t('editor.image.failed'));

                return null;
            } finally {
                setUploading(false);
            }
        },
        [ensureArticle, maxMegabytes, t],
    );

    return { upload, uploading };
}
