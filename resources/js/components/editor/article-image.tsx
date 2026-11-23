import { mergeAttributes, Node } from '@tiptap/core';
import {
    NodeViewWrapper,
    ReactNodeViewRenderer,
    type NodeViewProps,
} from '@tiptap/react';
import { ImageOff, Trash2 } from 'lucide-react';
import { useId } from 'react';
import ImageAltField, {
    DecorativeCheckbox,
    needsAlt,
} from '@/components/editor/image-alt-field';
import FormField from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export type ArticleImageAttrs = {
    id: string;
    alt: string | null;
    caption: string | null;
    decorative: boolean;
};

type Options = {
    /** O endereço de uma imagem já enviada, pelo id. */
    resolve: (id: string) => string | undefined;
    textMax: number;
};

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        articleImage: {
            insertArticleImage: (id: string) => ReturnType;
        };
    }
}

/**
 * Imagem no texto (RF-080, RF-087, RF-088), com o mesmo nome e atributos
 * do servidor (`EditorSchema`). Só entra pelo envio: imagem colada de
 * outro site é ignorada, porque precisa passar pelo tratamento (RF-082).
 */
export const ArticleImage = Node.create<Options>({
    name: 'image',
    group: 'block',
    atom: true,
    draggable: true,

    addOptions() {
        return { resolve: () => undefined, textMax: 250 };
    },

    addAttributes() {
        return {
            id: { default: null },
            alt: { default: null },
            caption: { default: null },
            decorative: { default: false },
        };
    },

    parseHTML() {
        return [];
    },

    renderHTML({ HTMLAttributes }) {
        return ['figure', mergeAttributes({ 'data-image': HTMLAttributes.id })];
    },

    addCommands() {
        return {
            insertArticleImage:
                (id) =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs: { id } }),
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageView);
    },
});

function ImageView({
    node,
    updateAttributes,
    deleteNode,
    extension,
    selected,
}: NodeViewProps) {
    const { t } = useTranslation();
    const id = useId();
    const attrs = node.attrs as ArticleImageAttrs;
    const options = extension.options as Options;
    const src = options.resolve(attrs.id);
    const missing = needsAlt(attrs.alt, attrs.decorative);

    return (
        <NodeViewWrapper
            as="figure"
            data-image-missing-alt={missing || undefined}
            className={cn(
                'not-prose my-7 flex flex-col gap-3 rounded-[18px] border bg-surface p-3',
                missing ? 'border-2 border-danger-fg' : 'border-border',
                selected && 'ring-[3px] ring-ring',
            )}
            contentEditable={false}
        >
            <div className="relative">
                {src ? (
                    <img
                        src={src}
                        alt=""
                        className="max-h-[420px] w-full rounded-[12px] bg-surface-muted object-contain"
                        draggable={false}
                        data-drag-handle
                    />
                ) : (
                    <div className="flex aspect-[16/7] items-center justify-center rounded-[12px] bg-surface-muted text-text-secondary">
                        <ImageOff aria-hidden="true" className="size-8" />
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => deleteNode()}
                    aria-label={t('editor.image.remove')}
                    className="absolute top-2 right-2 inline-flex size-9 items-center justify-center rounded-full bg-surface/90 text-text-primary shadow-sm hover:bg-surface"
                >
                    <Trash2 aria-hidden="true" className="size-4" />
                </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <ImageAltField
                    id={`${id}-alt`}
                    alt={attrs.alt}
                    decorative={attrs.decorative}
                    maxLength={options.textMax}
                    onChange={updateAttributes}
                />
                <div className="flex flex-col gap-2">
                    <FormField
                        id={`${id}-caption`}
                        label={
                            <>
                                {t('editor.image.caption')}{' '}
                                <span className="font-semibold text-text-secondary">
                                    {t('editor.details.optional')}
                                </span>
                            </>
                        }
                    >
                        {(field) => (
                            <Input
                                {...field}
                                value={attrs.caption ?? ''}
                                maxLength={options.textMax}
                                onChange={(event) =>
                                    updateAttributes({
                                        caption: event.target.value || null,
                                    })
                                }
                                className="h-11 rounded-inner text-meta"
                            />
                        )}
                    </FormField>
                    <DecorativeCheckbox
                        checked={attrs.decorative}
                        onChange={updateAttributes}
                    />
                </div>
            </div>
        </NodeViewWrapper>
    );
}
