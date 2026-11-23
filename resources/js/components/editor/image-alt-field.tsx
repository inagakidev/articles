import { Checkbox } from '@/components/ui/checkbox';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';

/** Se a imagem ainda precisa de texto alternativo para o envio (RF-087). */
export function needsAlt(alt: string | null, decorative: boolean): boolean {
    return !decorative && (alt ?? '').trim() === '';
}

/**
 * Texto alternativo (RF-087), usado na capa e nas imagens do texto. Sem
 * ele e sem a marcação de decorativa, o campo fica em erro, como na prancha.
 */
export default function ImageAltField({
    id,
    alt,
    decorative,
    maxLength,
    onChange,
}: {
    id: string;
    alt: string | null;
    decorative: boolean;
    maxLength: number;
    onChange: (value: { alt: string | null }) => void;
}) {
    const { t } = useTranslation();
    const missing = needsAlt(alt, decorative);

    return (
        <FormField
            id={id}
            label={t('editor.image.alt')}
            error={missing ? t('editor.image.alt_missing') : undefined}
        >
            {(field) => (
                <Input
                    {...field}
                    value={alt ?? ''}
                    maxLength={maxLength}
                    disabled={decorative}
                    placeholder={t('editor.image.alt_placeholder')}
                    onChange={(event) =>
                        onChange({ alt: event.target.value || null })
                    }
                    className="h-11 rounded-inner text-meta"
                />
            )}
        </FormField>
    );
}

/** "Imagem decorativa": dispensa o texto alternativo, e o leitor de tela pula. */
export function DecorativeCheckbox({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (value: { decorative: boolean }) => void;
}) {
    const { t } = useTranslation();

    return (
        <label className="flex items-center gap-2 text-meta font-semibold">
            <Checkbox
                checked={checked}
                onCheckedChange={(value) =>
                    onChange({ decorative: value === true })
                }
                className="size-4.5"
            />
            {t('editor.image.decorative')}
        </label>
    );
}
