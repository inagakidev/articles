<?php

namespace App\Support\Editor;

use App\Support\Editor\Tiptap\AnchoredHeading;
use App\Support\Editor\Tiptap\ArticleFigure;
use App\Support\Editor\Tiptap\HighlightedCodeBlock;
use App\Support\Editor\Tiptap\PaletteColor;
use App\Support\Editor\Tiptap\PaletteHighlight;
use Illuminate\Support\Str;
use Tiptap\Editor;
use Tiptap\Extensions\StarterKit;
use Tiptap\Extensions\TextAlign;
use Tiptap\Marks\Link;
use Tiptap\Nodes\Table;
use Tiptap\Nodes\TableCell;
use Tiptap\Nodes\TableHeader;
use Tiptap\Nodes\TableRow;

/**
 * O único ponto que transforma o documento do editor em leitura (D51):
 * a prévia e a página pública usam este mesmo resultado (p4-06). Recebe o
 * documento já limpo pelo `DocumentSanitizer`.
 */
final class ArticleRenderer
{
    /**
     * @param  array<string, mixed>  $document
     * @param  array<string, ImageSource>  $images  as imagens do artigo, pelo id
     */
    public function render(array $document, array $images = []): RenderedArticle
    {
        [$document, $toc] = $this->anchorHeadings($document);

        $editor = new Editor(['extensions' => [
            new StarterKit([
                'heading' => false,
                'codeBlock' => false,
                'strike' => false,
                'underline' => false,
            ]),
            new AnchoredHeading(['levels' => EditorSchema::HEADING_LEVELS]),
            new HighlightedCodeBlock,
            new ArticleFigure($images),
            new Link(['HTMLAttributes' => ['target' => null, 'rel' => 'nofollow ugc noopener']]),
            new PaletteColor,
            new PaletteHighlight,
            new Table,
            new TableRow,
            new TableHeader,
            new TableCell,
            new TextAlign(['types' => ['heading', 'paragraph'], 'alignments' => EditorSchema::ALIGNMENTS]),
        ]]);

        $editor->setContent($document);
        $text = $this->text($document);
        $words = self::countWords($text);

        return new RenderedArticle(
            html: $editor->getHTML(),
            toc: $toc,
            text: $text,
            words: $words,
            characters: mb_strlen($text),
            readingMinutes: self::readingMinutes($words),
        );
    }

    /**
     * Texto puro do documento, um bloco por linha, para busca e contagens.
     *
     * @param  array<string, mixed>  $document
     */
    public function text(array $document): string
    {
        $blocks = [];
        $this->collectText($document, $blocks);

        return trim(implode("\n", array_filter($blocks, fn (string $block) => trim($block) !== '')));
    }

    /** Tempo de leitura, em minutos inteiros, nunca zero (RF-137). */
    public static function readingMinutes(int $words): int
    {
        return max(1, (int) ceil($words / EditorSchema::WORDS_PER_MINUTE));
    }

    public static function countWords(string $text): int
    {
        $words = preg_match_all('/[\p{L}\p{N}][\p{L}\p{N}\'’_-]*/u', $text);

        return $words === false ? 0 : $words;
    }

    /**
     * Dá um id a cada título, a partir do texto, e monta o sumário.
     *
     * @param  array<string, mixed>  $document
     * @return array{0: array<string, mixed>, 1: list<array{id: string, text: string, level: int}>}
     */
    private function anchorHeadings(array $document): array
    {
        $toc = [];
        $used = [];

        foreach ($document['content'] ?? [] as $index => $node) {
            if (($node['type'] ?? null) !== 'heading') {
                continue;
            }

            $text = trim($this->text(['content' => [$node]]));

            if ($text === '') {
                continue;
            }

            $base = Str::slug($text) ?: 'secao';
            $id = $base;

            for ($n = 2; in_array($id, $used, true); $n++) {
                $id = "{$base}-{$n}";
            }

            $used[] = $id;
            $level = (int) ($node['attrs']['level'] ?? 2);
            $document['content'][$index]['attrs'] = [...($node['attrs'] ?? []), 'id' => $id];
            $toc[] = ['id' => $id, 'text' => $text, 'level' => $level];
        }

        return [$document, $toc];
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<int, string>  $blocks
     */
    private function collectText(array $node, array &$blocks): void
    {
        if (($node['type'] ?? null) === 'image') {
            // A legenda é texto visível; o texto alternativo, não.
            $blocks[] = (string) ($node['attrs']['caption'] ?? '');

            return;
        }

        if (($node['type'] ?? null) === 'text') {
            $blocks[array_key_last($blocks) ?? 0] = ($blocks[array_key_last($blocks) ?? 0] ?? '').$node['text'];

            return;
        }

        $isBlock = in_array($node['type'] ?? null, ['paragraph', 'heading', 'codeBlock', 'tableCell', 'tableHeader', 'listItem'], true);

        if ($isBlock) {
            $blocks[] = '';
        }

        foreach ($node['content'] ?? [] as $child) {
            if (is_array($child)) {
                $this->collectText($child, $blocks);
            }
        }

        if (($node['type'] ?? null) === 'hardBreak') {
            $blocks[] = '';
        }
    }
}
