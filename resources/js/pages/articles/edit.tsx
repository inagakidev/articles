import { Head, Link, router } from '@inertiajs/react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { ArrowLeft, Eye, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { useAutosave } from '@/hooks/use-autosave';
import type { DraftFields, SaveStatus } from '@/hooks/use-autosave';
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
        updatedAt: string | null;
        createdAt: string | null;
    };
    categories: EditorCategory[];
    limits: {
        title: number;
        characters: number;
        tags: number;
        wordsPerMinute: number;
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
    const editor = useEditor({
        extensions: editorExtensions({
            placeholder: t('editor.content_placeholder'),
            characterLimit: limits.characters,
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
        }),
    }) ?? { words: 0, characters: 0, empty: true };

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
    ];

    const side = (
        <div className="flex flex-col gap-6">
            <SubmitChecklist items={checklist} />
            <DetailsPanel
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
