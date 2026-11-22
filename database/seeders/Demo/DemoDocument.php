<?php

namespace Database\Seeders\Demo;

/**
 * Monta documentos do Tiptap para o conteúdo de demonstração, sem escrever
 * o JSON à mão. No texto, `**negrito**`, `*itálico*`, `` `código` ``,
 * `==destaque==` e `[texto](https://…)` viram as marcas do editor.
 */
final class DemoDocument
{
    /**
     * @param  list<array<string, mixed>>  $blocks
     * @return array<string, mixed>
     */
    public static function make(array $blocks): array
    {
        return ['type' => 'doc', 'content' => $blocks];
    }

    /** @return array<string, mixed> */
    public static function h2(string $text): array
    {
        return ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => self::inline($text)];
    }

    /** @return array<string, mixed> */
    public static function h3(string $text): array
    {
        return ['type' => 'heading', 'attrs' => ['level' => 3], 'content' => self::inline($text)];
    }

    /** @return array<string, mixed> */
    public static function p(string $text): array
    {
        return ['type' => 'paragraph', 'content' => self::inline($text)];
    }

    /** @return array<string, mixed> */
    public static function code(string $language, string $code): array
    {
        return ['type' => 'codeBlock', 'attrs' => ['language' => $language], 'content' => [['type' => 'text', 'text' => rtrim($code)]]];
    }

    /**
     * @param  list<string>  $items
     * @return array<string, mixed>
     */
    public static function ul(array $items): array
    {
        return ['type' => 'bulletList', 'content' => self::items($items)];
    }

    /**
     * @param  list<string>  $items
     * @return array<string, mixed>
     */
    public static function ol(array $items): array
    {
        return ['type' => 'orderedList', 'content' => self::items($items)];
    }

    /** @return array<string, mixed> */
    public static function quote(string $text): array
    {
        return ['type' => 'blockquote', 'content' => [self::p($text)]];
    }

    /** @return array<string, mixed> */
    public static function hr(): array
    {
        return ['type' => 'horizontalRule'];
    }

    /**
     * @param  list<string>  $header
     * @param  list<list<string>>  $rows
     * @return array<string, mixed>
     */
    public static function table(array $header, array $rows): array
    {
        $row = fn (array $cells, string $type) => [
            'type' => 'tableRow',
            'content' => array_map(fn (string $cell) => ['type' => $type, 'content' => [self::p($cell)]], $cells),
        ];

        return ['type' => 'table', 'content' => [$row($header, 'tableHeader'), ...array_map(fn (array $cells) => $row($cells, 'tableCell'), $rows)]];
    }

    /**
     * @param  list<string>  $items
     * @return list<array<string, mixed>>
     */
    private static function items(array $items): array
    {
        return array_map(fn (string $item) => ['type' => 'listItem', 'content' => [self::p($item)]], $items);
    }

    /** @return list<array<string, mixed>> */
    private static function inline(string $text): array
    {
        $parts = preg_split('/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|==[^=]+==|\[[^\]]+\]\([^)]+\))/u', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [];

        return array_map(function (string $part): array {
            return match (true) {
                str_starts_with($part, '**') => self::text(substr($part, 2, -2), ['type' => 'bold']),
                str_starts_with($part, '==') => self::text(substr($part, 2, -2), ['type' => 'highlight', 'attrs' => ['color' => 'amarelo']]),
                str_starts_with($part, '`') => self::text(substr($part, 1, -1), ['type' => 'code']),
                str_starts_with($part, '*') => self::text(substr($part, 1, -1), ['type' => 'italic']),
                (bool) preg_match('/^\[([^\]]+)\]\(([^)]+)\)$/u', $part, $link) => self::text($link[1], ['type' => 'link', 'attrs' => ['href' => $link[2]]]),
                default => self::text($part),
            };
        }, $parts);
    }

    /**
     * @param  array<string, mixed>|null  $mark
     * @return array<string, mixed>
     */
    private static function text(string $text, ?array $mark = null): array
    {
        return $mark === null ? ['type' => 'text', 'text' => $text] : ['type' => 'text', 'text' => $text, 'marks' => [$mark]];
    }
}
