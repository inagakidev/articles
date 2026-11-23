import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Baseline,
    Bold,
    Code,
    Highlighter,
    ImagePlus,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    SquareCode,
    Table,
    Undo2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import LinkDialog from '@/components/editor/link-dialog';
import type { PaletteColor } from '@/components/editor/palette-marks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Barra de formatação (prancha "Editor"). Só oferece o que o esquema aceita
 * (RF-066 a RF-069); cada botão diz o próprio nome e se está ligado.
 */
export default function Toolbar({
    editor,
    colors,
    codeLanguages,
    image,
    className,
}: {
    editor: Editor;
    colors: PaletteColor[];
    codeLanguages: string[];
    /** Abre a escolha de arquivo; a página envia e insere (RF-082). */
    image: { onPick: () => void; disabled: boolean };
    className?: string;
}) {
    const { t } = useTranslation();
    const [linkOpen, setLinkOpen] = useState(false);
    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            block: current.isActive('heading', { level: 2 })
                ? 'h2'
                : current.isActive('heading', { level: 3 })
                  ? 'h3'
                  : 'p',
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            code: current.isActive('code'),
            link: current.isActive('link'),
            bulletList: current.isActive('bulletList'),
            orderedList: current.isActive('orderedList'),
            blockquote: current.isActive('blockquote'),
            codeBlock: current.isActive('codeBlock'),
            language:
                (current.getAttributes('codeBlock').language as
                    | string
                    | null) ?? '',
            table: current.isActive('table'),
            align:
                (['center', 'right'] as const).find((value) =>
                    current.isActive({ textAlign: value }),
                ) ?? 'left',
            textColor: current.getAttributes('textColor').color as
                | string
                | undefined,
            highlight: current.getAttributes('highlight').color as
                | string
                | undefined,
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
        }),
    });
    const chain = () => editor.chain().focus();

    return (
        <div
            role="toolbar"
            aria-label={t('editor.toolbar.label')}
            aria-controls="article-content"
            className={cn('flex flex-wrap items-center gap-0.5', className)}
        >
            <select
                aria-label={t('editor.toolbar.block')}
                value={state.block}
                onChange={(event) => {
                    const value = event.target.value;

                    if (value === 'p') {
                        chain().setParagraph().run();
                    } else {
                        chain()
                            .setHeading({ level: value === 'h2' ? 2 : 3 })
                            .run();
                    }
                }}
                className="mr-1 h-9 rounded-full border border-border bg-surface pr-8 pl-3.5 text-meta font-semibold text-text-primary"
            >
                <option value="p">{t('editor.toolbar.paragraph')}</option>
                <option value="h2">{t('editor.toolbar.heading2')}</option>
                <option value="h3">{t('editor.toolbar.heading3')}</option>
            </select>

            <Group>
                <Tool
                    Icon={Bold}
                    label="editor.toolbar.bold"
                    active={state.bold}
                    onClick={() => chain().toggleBold().run()}
                />
                <Tool
                    Icon={Italic}
                    label="editor.toolbar.italic"
                    active={state.italic}
                    onClick={() => chain().toggleItalic().run()}
                />
                <Tool
                    Icon={Code}
                    label="editor.toolbar.code"
                    active={state.code}
                    onClick={() => chain().toggleCode().run()}
                />
                <Tool
                    Icon={Link2}
                    label="editor.toolbar.link"
                    active={state.link}
                    onClick={() => setLinkOpen(true)}
                />
            </Group>

            <Group>
                <Tool
                    Icon={List}
                    label="editor.toolbar.bullet_list"
                    active={state.bulletList}
                    onClick={() => chain().toggleBulletList().run()}
                />
                <Tool
                    Icon={ListOrdered}
                    label="editor.toolbar.ordered_list"
                    active={state.orderedList}
                    onClick={() => chain().toggleOrderedList().run()}
                />
                <Tool
                    Icon={Quote}
                    label="editor.toolbar.blockquote"
                    active={state.blockquote}
                    onClick={() => chain().toggleBlockquote().run()}
                />
                <Tool
                    Icon={SquareCode}
                    label="editor.toolbar.code_block"
                    active={state.codeBlock}
                    onClick={() => chain().toggleCodeBlock().run()}
                />
                <TableTool editor={editor} active={state.table} />
                <Tool
                    Icon={ImagePlus}
                    label="editor.toolbar.image"
                    disabled={image.disabled}
                    onClick={image.onPick}
                />
                <Tool
                    Icon={Minus}
                    label="editor.toolbar.divider"
                    onClick={() => chain().setHorizontalRule().run()}
                />
            </Group>

            <Group>
                <Tool
                    Icon={AlignLeft}
                    label="editor.toolbar.align_left"
                    active={state.align === 'left'}
                    onClick={() => chain().setTextAlign('left').run()}
                />
                <Tool
                    Icon={AlignCenter}
                    label="editor.toolbar.align_center"
                    active={state.align === 'center'}
                    onClick={() => chain().setTextAlign('center').run()}
                />
                <Tool
                    Icon={AlignRight}
                    label="editor.toolbar.align_right"
                    active={state.align === 'right'}
                    onClick={() => chain().setTextAlign('right').run()}
                />
            </Group>

            <Group>
                <ColorMenu
                    Icon={Baseline}
                    label="editor.toolbar.text_color"
                    colors={colors}
                    current={state.textColor}
                    swatch="article-color"
                    onPick={(color) =>
                        color
                            ? chain().setTextColor(color).run()
                            : chain().unsetTextColor().run()
                    }
                />
                <ColorMenu
                    Icon={Highlighter}
                    label="editor.toolbar.highlight"
                    colors={colors}
                    current={state.highlight}
                    swatch="article-highlight"
                    onPick={(color) =>
                        color
                            ? chain().setPaletteHighlight(color).run()
                            : chain().unsetPaletteHighlight().run()
                    }
                />
            </Group>

            <Group>
                <Tool
                    Icon={Undo2}
                    label="editor.toolbar.undo"
                    disabled={!state.canUndo}
                    onClick={() => chain().undo().run()}
                />
                <Tool
                    Icon={Redo2}
                    label="editor.toolbar.redo"
                    disabled={!state.canRedo}
                    onClick={() => chain().redo().run()}
                />
            </Group>

            {state.codeBlock && (
                <select
                    aria-label={t('editor.toolbar.language')}
                    value={state.language}
                    onChange={(event) =>
                        chain()
                            .updateAttributes('codeBlock', {
                                language: event.target.value || null,
                            })
                            .run()
                    }
                    className="h-9 rounded-full border border-border bg-surface pr-8 pl-3.5 text-meta text-text-primary"
                >
                    <option value="">
                        {t('editor.toolbar.language_none')}
                    </option>
                    {codeLanguages.map((language) => (
                        <option key={language} value={language}>
                            {language}
                        </option>
                    ))}
                </select>
            )}

            <LinkDialog
                editor={editor}
                open={linkOpen}
                onOpenChange={setLinkOpen}
            />
        </div>
    );
}

function Group({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center gap-0.5 border-l border-border pl-1 first:border-l-0">
            {children}
        </div>
    );
}

function Tool({
    Icon,
    label,
    active,
    disabled,
    onClick,
}: {
    Icon: LucideIcon;
    label: TranslationKey;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            aria-label={t(label)}
            title={t(label)}
            aria-pressed={active === undefined ? undefined : active}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className={cn(
                'inline-flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-hover disabled:text-disabled-text disabled:hover:bg-transparent',
                active && 'bg-surface-selected text-text-on-selected',
            )}
        >
            <Icon aria-hidden="true" className="size-[18px]" />
        </button>
    );
}

function ColorMenu({
    Icon,
    label,
    colors,
    current,
    swatch,
    onPick,
}: {
    Icon: LucideIcon;
    label: TranslationKey;
    colors: PaletteColor[];
    current?: string;
    swatch: 'article-color' | 'article-highlight';
    onPick: (color: PaletteColor | null) => void;
}) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t(label)}
                title={t(label)}
                className={cn(
                    'inline-flex size-9 items-center justify-center rounded-full text-text-primary hover:bg-surface-hover',
                    current && 'bg-surface-selected text-text-on-selected',
                )}
            >
                <Icon aria-hidden="true" className="size-[18px]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
                {colors.map((color) => (
                    <DropdownMenuItem
                        key={color}
                        onSelect={() => onPick(color)}
                        aria-checked={current === color}
                        role="menuitemradio"
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                'inline-flex h-6 min-w-8 items-center justify-center rounded-full px-1.5 text-caption font-bold',
                                `${swatch}-${color}`,
                            )}
                        >
                            Aa
                        </span>
                        {t(`editor.color.${color}` as TranslationKey)}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuItem onSelect={() => onPick(null)}>
                    {t('editor.toolbar.no_color')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function TableTool({ editor, active }: { editor: Editor; active: boolean }) {
    const { t } = useTranslation();
    const chain = () => editor.chain().focus();

    if (!active) {
        return (
            <Tool
                Icon={Table}
                label="editor.toolbar.table"
                onClick={() =>
                    chain()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run()
                }
            />
        );
    }

    const actions: [TranslationKey, () => void][] = [
        ['editor.toolbar.table_add_row', () => chain().addRowAfter().run()],
        [
            'editor.toolbar.table_add_column',
            () => chain().addColumnAfter().run(),
        ],
        ['editor.toolbar.table_delete_row', () => chain().deleteRow().run()],
        [
            'editor.toolbar.table_delete_column',
            () => chain().deleteColumn().run(),
        ],
        ['editor.toolbar.table_delete', () => chain().deleteTable().run()],
    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label={t('editor.toolbar.table')}
                title={t('editor.toolbar.table')}
                className="inline-flex size-9 items-center justify-center rounded-full bg-surface-selected text-text-on-selected"
            >
                <Table aria-hidden="true" className="size-[18px]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {actions.map(([label, run]) => (
                    <DropdownMenuItem key={label} onSelect={run}>
                        {t(label)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
