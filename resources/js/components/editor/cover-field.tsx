import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import ImageAltField, {
    DecorativeCheckbox,
} from '@/components/editor/image-alt-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { IMAGE_ACCEPT } from '@/hooks/use-image-upload';
import type { UploadedImage } from '@/hooks/use-image-upload';
import { useTranslation } from '@/lib/i18n';

export type Cover = {
    id: string;
    src: string;
    alt: string | null;
    decorative: boolean;
};

/**
 * Capa opcional (RF-079), com texto alternativo ou decorativa (RF-087).
 * Vazia, é a área tracejada da prancha "Editor".
 */
export default function CoverField({
    cover,
    maxMegabytes,
    textMax,
    uploading,
    upload,
    onChange,
}: {
    cover: Cover | null;
    maxMegabytes: number;
    textMax: number;
    uploading: boolean;
    upload: (file: File) => Promise<UploadedImage | null>;
    onChange: (cover: Cover | null) => void;
}) {
    const { t } = useTranslation();
    const input = useRef<HTMLInputElement>(null);

    const pick = async (file: File | undefined) => {
        if (!file) {
            return;
        }

        const image = await upload(file);

        if (image) {
            onChange({
                id: image.id,
                src: image.src,
                alt: cover?.alt ?? null,
                decorative: cover?.decorative ?? false,
            });
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-meta font-bold">
                {t('editor.cover.label')}{' '}
                <span className="font-semibold text-text-secondary">
                    {t('editor.details.optional')}
                </span>
            </span>
            <input
                ref={input}
                type="file"
                accept={IMAGE_ACCEPT}
                hidden
                tabIndex={-1}
                onChange={(event) => {
                    void pick(event.target.files?.[0]);
                    event.target.value = '';
                }}
            />

            {cover === null ? (
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => input.current?.click()}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-border-strong bg-surface-muted text-meta font-bold text-text-primary hover:bg-surface-hover disabled:cursor-wait"
                >
                    {uploading ? (
                        <Spinner />
                    ) : (
                        <Upload aria-hidden="true" className="size-5" />
                    )}
                    {uploading
                        ? t('editor.image.uploading')
                        : t('editor.cover.upload')}
                    <span className="text-caption font-semibold text-text-secondary">
                        {t('editor.image.formats', { max: maxMegabytes })}
                    </span>
                </button>
            ) : (
                <div className="flex flex-col gap-3">
                    <img
                        src={cover.src}
                        alt=""
                        className="aspect-video w-full rounded-[14px] bg-surface-muted object-cover"
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={uploading}
                            onClick={() => input.current?.click()}
                        >
                            <ImagePlus aria-hidden="true" />
                            {t('editor.cover.replace')}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(null)}
                        >
                            <Trash2 aria-hidden="true" />
                            {t('editor.cover.remove')}
                        </Button>
                    </div>
                    <ImageAltField
                        id="cover-alt"
                        alt={cover.alt}
                        decorative={cover.decorative}
                        maxLength={textMax}
                        onChange={({ alt }) => onChange({ ...cover, alt })}
                    />
                    <DecorativeCheckbox
                        checked={cover.decorative}
                        onChange={({ decorative }) =>
                            onChange({ ...cover, decorative })
                        }
                    />
                </div>
            )}
        </div>
    );
}
