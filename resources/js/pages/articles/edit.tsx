import { Head, Link, router } from '@inertiajs/react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { ArrowLeft, Eye, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CoverField from '@/components/editor/cover-field';
import type { Cover } from '@/components/editor/cover-field';
import DetailsPanel from '@/components/editor/details-panel';
import type { EditorCategory } from '@/components/editor/details-panel';
import EditorStats from '@/components/editor/editor-stats';
import EmptyTips from '@/components/editor/empty-tips';
import { editorExtensions } from '@/components/editor/extensions';
import type { PaletteColor } from '@/components/editor/palette-marks';
import SubmitChecklist from '@/components/editor/submit-checklist';
import Toolbar from '@/components/editor/toolbar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import StatusBadge from '@/components/ui/status-badge';
import { needsAlt } from '@/components/editor/image-alt-field';
import { useAutosave } from '@/hooks/use-autosave';
import type { DraftFields, SaveStatus } from '@/hooks/use-autosave';
import { IMAGE_ACCEPT, useImageUpload } from '@/hooks/use-image-upload';
import { useTranslation } from '@/lib/i18n';
import { dashboard } from '@/routes';
import { preview } from '@/routes/articles';

type Props = {
    articleId: number | null;
    published: boolean;
    draft: {
        title: string;
        content: unknown;
        language: string | null;
        categoryId: number | null;
        tags: string[];
        cover: Cover | null;
        updatedAt: string | null;
        createdAt: string | null;
    };
    /** Endereço de cada imagem já enviada para o artigo, pelo id. */
    images: Record<string, string>;
    categories: EditorCategory[];
    limits: {
        title: number;
        characters: number;
        tags: number;
        wordsPerMinute: number;
        images: number;
        imageText: number;
        imageMegabytes: number;
    };
    colors: PaletteColor[];
    codeLanguages: string[];
};

/**
 * O editor (pranchas "Editor", "Editor vazio" e "Detalhes do artigo ·
 * mobile"): título, texto, detalhes e o que falta para enviar. Tudo é
 * salvo sozinho (RF-071). O envio para revisão entra na fatia 10.
 */
export default function Edit(props: Props) {
    const { t } = useTranslation();
    const { draft, limits } = props;
    const isNew = props.articleId === null;
    const neverSaved =
        draft.updatedAt === null || draft.updatedAt === draft.createdAt;
    const autosave = useAutosave({
        articleId: props.articleId,
        savedAt: neverSaved ? null : draft.updatedAt,
    });
    const [title, setTitle] = useState(draft.title);
    const [details, setDetails] = useState({
        language: draft.language,
        category_id: draft.categoryId,
        tags: draft.tags,
    });
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [cover, setCover] = useState(draft.cover);
    // Lido pelo nó de imagem a cada desenho; cresce a cada envio.
    const sources = useRef<Record<string, string>>({ ...props.images });
    const imageInput = useRef<HTMLInputElement>(null);
    const images = useImageUpload({
        ensureArticle: autosave.ensureArticle,
        maxMegabytes: limits.imageMegabytes,
    });
    const editor = useEditor({
        extensions: editorExtensions({
            placeholder: t('editor.content_placeholder'),
            characterLimit: limits.characters,
            images: {
                resolve: (id) => sources.current[id],
                textMax: limits.imageText,
            },
        }),
        content: (draft.content as object | null) ?? '',
        editorProps: {
            attributes: {
                id: 'article-content',
                class: 'article-body min-h-40 pb-16 outline-none',
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-label': t('editor.content_label'),
            },
        },
        onUpdate: ({ editor: current }) =>
            autosave.change({ content: current.getJSON() }),
    });
    const counts = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            words:
                (current?.storage.characterCount.words() as
                    | number
                    | undefined) ?? 0,
            characters:
                (current?.storage.characterCount.characters() as
                    | number
                    | undefined) ?? 0,
            empty: current?.isEmpty ?? true,
            ...imageCounts(current),
        }),
    }) ?? { words: 0, characters: 0, empty: true, images: 0, missingAlt: 0 };

    async function insertImage(file: File | undefined) {
        const image = file ? await images.upload(file) : null;

        if (image && editor) {
            sources.current[image.id] = image.src;
            editor.chain().focus().insertArticleImage(image.id).run();
        }
    }

    function changeCover(next: Cover | null) {
        if (next) {
            sources.current[next.id] = next.src;
        }

        setCover(next);
        autosave.change({
            cover_image: next?.id ?? null,
            cover_alt: next?.alt ?? null,
            cover_decorative: next?.decorative ?? false,
        });
    }

    function changeDetails(fields: Partial<DraftFields>) {
        setDetails((current) => ({ ...current, ...fields }));
        autosave.change(fields);
    }

    const checklist = [
        { key: 'editor.checklist.title' as const, done: title.trim() !== '' },
        { key: 'editor.checklist.content' as const, done: !counts.empty },
        {
            key: 'editor.checklist.category' as const,
            done: details.category_id !== null,
        },
        {
            key: 'editor.checklist.language' as const,
            done: details.language !== null,
        },
        ...(counts.images > 0 || cover !== null
            ? [
                  {
                      key: 'editor.checklist.images_alt' as const,
                      done:
                          counts.missingAlt === 0 &&
                          !(cover && needsAlt(cover.alt, cover.decorative)),
                      fix: () => focusMissingAlt(),
                  },
              ]
            : []),
    ];

    /** Leva ao primeiro campo de texto alternativo vazio, no texto ou na capa. */
    function focusMissingAlt() {
        const field =
            document.querySelector<HTMLInputElement>(
                '[data-image-missing-alt] input:not([disabled])',
            ) ??
            (cover && needsAlt(cover.alt, cover.decorative)
                ? document.querySelector<HTMLInputElement>('#cover-alt')
                : null);

        if (field === null) {
            setDetailsOpen(true);

            return;
        }

        field.scrollIntoView({ block: 'center' });
        field.focus();
    }

    const side = (
        <div className="flex flex-col gap-6">
            <SubmitChecklist items={checklist} />
            <DetailsPanel
                cover={
                    <CoverField
                        cover={cover}
                        maxMegabytes={limits.imageMegabytes}
                        textMax={limits.imageText}
                        uploading={images.uploading}
                        upload={images.upload}
                        onChange={changeCover}
                    />
                }
                fields={details}
                categories={props.categories}
                maxTags={limits.tags}
                errors={autosave.errors}
                isNew={isNew}
                onChange={changeDetails}
            />
            <EditorStats
                words={counts.words}
                characters={counts.characters}
                maxCharacters={limits.characters}
                wordsPerMinute={limits.wordsPerMinute}
                images={counts.images}
                maxImages={limits.images}
            />
        </div>
    );

    return (
        <>
            <Head
                title={t(isNew ? 'editor.page_title_new' : 'editor.page_title')}
            />

            <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-page items-center gap-3 px-4 sm:px-6">
                    <Link
                        href={dashboard()}
                        aria-label={t('editor.back')}
                        className="inline-flex items-center gap-1.5 rounded-full text-meta font-bold text-primary-text hover:underline"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        <span aria-hidden="true" className="hidden sm:inline">
                            {t('editor.back')}
                        </span>
                    </Link>
                    <StatusBadge status="draft" size="sm" />
                    <SaveIndicator
                        status={autosave.status}
                        savedAt={autosave.savedAt}
                    />
                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setDetailsOpen(true)}
                        >
                            <SlidersHorizontal aria-hidden="true" />
                            {t('editor.details_button')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={autosave.articleId === null}
                            onClick={async () => {
                                await autosave.flush();

                                if (autosave.articleId !== null) {
                                    router.visit(preview(autosave.articleId));
                                }
                            }}
                        >
                            <Eye aria-hidden="true" />
                            {t('editor.preview')}
                        </Button>
                    </div>
                </div>
            </header>

            {editor && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-2 py-1.5 backdrop-blur-md lg:sticky lg:top-16 lg:bottom-auto lg:border-t-0 lg:border-b lg:bg-bg/90">
                    <Toolbar
                        editor={editor}
                        colors={props.colors}
                        codeLanguages={props.codeLanguages}
                        image={{
                            onPick: () => imageInput.current?.click(),
                            disabled:
                                images.uploading ||
                                counts.images >= limits.images,
                        }}
                        className="mx-auto max-w-page [scrollbar-width:none] flex-nowrap overflow-x-auto lg:flex-wrap lg:px-4"
                    />
                </div>
            )}

            <div className="mx-auto flex max-w-page gap-10 px-4 pt-8 pb-32 sm:px-6 lg:pb-16">
                <main className="mx-auto w-full max-w-reading min-w-0">
                    <h1 className="sr-only">
                        {t(
                            isNew
                                ? 'editor.page_title_new'
                                : 'editor.page_title',
                        )}
                    </h1>
                    <TitleField
                        value={title}
                        max={limits.title}
                        error={autosave.errors.title}
                        onChange={(value) => {
                            setTitle(value);
                            autosave.change({ title: value });
                        }}
                        onEnter={() => {
                            // Foco já, sem esperar o próximo quadro: quem digita
                            // rápido não perde as primeiras letras no título.
                            editor?.view.dom.focus();
                            editor?.commands.setTextSelection(1);
                        }}
                    />
                    {autosave.errors.content && (
                        <p
                            role="alert"
                            className="mb-3 text-meta font-semibold text-danger-fg"
                        >
                            {autosave.errors.content}
                        </p>
                    )}
                    <input
                        ref={imageInput}
                        type="file"
                        accept={IMAGE_ACCEPT}
                        hidden
                        tabIndex={-1}
                        onChange={(event) => {
                            void insertImage(event.target.files?.[0]);
                            event.target.value = '';
                        }}
                    />
                    <EditorContent editor={editor} />
                    {counts.empty && title.trim() === '' && <EmptyTips />}
                </main>

                <aside className="hidden w-80 shrink-0 lg:block">
                    <div className="sticky top-32 rounded-card border border-border bg-surface p-5">
                        {side}
                    </div>
                </aside>
            </div>

            <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
                <SheetContent
                    side="bottom"
                    className="max-h-[85svh] overflow-y-auto rounded-t-section p-5 lg:hidden"
                >
                    <SheetTitle className="font-display text-h3 font-extrabold">
                        {t('editor.details.sheet_title')}
                    </SheetTitle>
                    {side}
                    <Button
                        type="button"
                        size="md"
                        onClick={() => setDetailsOpen(false)}
                    >
                        {t('editor.details.done')}
                    </Button>
                </SheetContent>
            </Sheet>
        </>
    );
}

function SaveIndicator({
    status,
    savedAt,
}: {
    status: SaveStatus;
    savedAt: string | null;
}) {
    const { t, locale } = useTranslation();
    const time = savedAt
        ? new Intl.DateTimeFormat(locale.replace('_', '-'), {
              hour: '2-digit',
              minute: '2-digit',
          }).format(new Date(savedAt))
        : '';
    const text =
        status === 'saving'
            ? t('editor.status.saving')
            : status === 'error'
              ? t('editor.status.error')
              : status === 'invalid'
                ? t('editor.status.invalid')
                : savedAt
                  ? t('editor.status.saved', { time })
                  : t('editor.status.unsaved');

    return (
        <span
            role="status"
            className={
                status === 'error' || status === 'invalid'
                    ? 'truncate text-caption font-semibold text-danger-fg'
                    : 'truncate text-caption text-text-secondary'
            }
        >
            {text}
        </span>
    );
}

function TitleField({
    value,
    max,
    error,
    onChange,
    onEnter,
}: {
    value: string;
    max: number;
    error?: string;
    onChange: (value: string) => void;
    onEnter: () => void;
}) {
    const { t } = useTranslation();
    const input = useRef<HTMLTextAreaElement>(null);

    // O título cresce com o texto, sem barra de rolagem.
    useEffect(() => {
        const element = input.current;

        if (element) {
            element.style.height = 'auto';
            element.style.height = `${element.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className="mb-6 flex flex-col gap-1">
            <label htmlFor="title" className="sr-only">
                {t('editor.title')}
            </label>
            <textarea
                ref={input}
                id="title"
                rows={1}
                value={value}
                maxLength={max}
                placeholder={t('editor.title_placeholder')}
                aria-describedby="title-count"
                aria-invalid={error ? true : undefined}
                onChange={(event) =>
                    onChange(event.target.value.replace(/\n/g, ' '))
                }
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        onEnter();
                    }
                }}
                className="w-full resize-none overflow-hidden bg-transparent font-display text-[2.25rem]/11 font-extrabold tracking-[-0.02em] text-text-primary outline-none placeholder:text-text-muted"
            />
            <span
                id="title-count"
                className="self-end text-caption text-text-secondary"
            >
                {t('editor.title_count', { count: value.length, max })}
            </span>
            {error && <span className="text-meta text-danger-fg">{error}</span>}
        </div>
    );
}

/** Quantas imagens o texto tem e quantas ainda sem texto alternativo. */
function imageCounts(editor: Editor | null) {
    let images = 0;
    let missingAlt = 0;

    editor?.state.doc.descendants((node) => {
        if (node.type.name === 'image') {
            images += 1;

            if (
                needsAlt(
                    node.attrs.alt as string | null,
                    node.attrs.decorative === true,
                )
            ) {
                missingAlt += 1;
            }
        }
    });

    return { images, missingAlt };
}
