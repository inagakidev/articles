import { Head, Link, router } from '@inertiajs/react';
import { EditorContent, useEditor } from '@tiptap/react';
import { ArrowLeft, Eye, Send, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import CoverField from '@/components/editor/cover-field';
import type { Cover } from '@/components/editor/cover-field';
import DetailsPanel from '@/components/editor/details-panel';
import type { EditorCategory } from '@/components/editor/details-panel';
import EditorStats from '@/components/editor/editor-stats';
import EmptyTips from '@/components/editor/empty-tips';
import { editorExtensions } from '@/components/editor/extensions';
import type { PaletteColor } from '@/components/editor/palette-marks';
import SubmitChecklist from '@/components/editor/submit-checklist';
import type { ChecklistItem } from '@/components/editor/submit-checklist';
import Toolbar from '@/components/editor/toolbar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import StatusBadge from '@/components/articles/status-badge';
import { needsAlt } from '@/components/editor/image-alt-field';
import { useAutosave } from '@/hooks/use-autosave';
import type { DraftFields } from '@/hooks/use-autosave';
import { IMAGE_ACCEPT, useImageUpload } from '@/hooks/use-image-upload';
import { useTranslation } from '@/lib/i18n';
import { mine, preview } from '@/routes/articles';
import * as submission from '@/routes/articles/submission';
import SaveIndicator from '@/components/editor/save-indicator';
import TitleField from '@/components/editor/title-field';
import { useEditorCounts } from '@/hooks/use-editor-counts';
type Props = {
    articleId: number | null;
    published: boolean;
    /** Outra versão já está na fila: esta só vai depois da retirada (RF-102). */
    hasPending: boolean;
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
    const [submitting, setSubmitting] = useState(false);
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
    const counts = useEditorCounts(editor);

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

    const missing: ChecklistItem[] = checklist.filter((item) => !item.done);

    /**
     * Envia para a revisão (RF-303, RF-318). O que falta é conferido aqui,
     * para não esperar uma recusa, e de novo no servidor. O botão ignora o
     * segundo clique enquanto envia (estado `form.submitting`).
     */
    async function submit() {
        if (missing.length > 0) {
            toast.error(
                missing.length === 1
                    ? t('editor.checklist.missing_one')
                    : t('editor.checklist.missing', { count: missing.length }),
            );
            missing[0].fix?.();
            setDetailsOpen(window.matchMedia('(max-width: 1023px)').matches);

            return;
        }

        // Um campo recusado pelo salvamento (título longo demais) não foi
        // salvo: enviar agora mandaria a versão anterior dele.
        if (Object.keys(autosave.errors).length > 0) {
            toast.error(t('editor.submit.fix_errors'));

            return;
        }

        if (props.hasPending) {
            toast.error(t('submission.refused.pending'));

            return;
        }

        setSubmitting(true);
        const id = await autosave.ensureArticle();

        if (id === null) {
            setSubmitting(false);
            toast.error(t('editor.submit.failed'));

            return;
        }

        router.post(
            submission.store(id).url,
            {},
            {
                onError: (errors) =>
                    toast.error(
                        Object.values(errors)[0] ?? t('editor.submit.failed'),
                    ),
                onFinish: () => setSubmitting(false),
            },
        );
    }

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
                        href={mine()}
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
                            <span className="sr-only sm:not-sr-only">
                                {t('editor.preview')}
                            </span>
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={submitting}
                            onClick={() => void submit()}
                        >
                            <Send aria-hidden="true" />
                            {submitting ? (
                                t('editor.submit.sending')
                            ) : (
                                <>
                                    <span className="hidden sm:inline">
                                        {t('editor.submit.action')}
                                    </span>
                                    <span className="sm:hidden">
                                        {t('editor.submit.short')}
                                    </span>
                                </>
                            )}
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
