<?php

namespace App\Support\Editor;

/**
 * Limpa o JSON que chega do editor (diretriz 3.4, D51): só ficam os nós,
 * marcas e atributos do `EditorSchema`, com valores conferidos. O resto é
 * descartado em silêncio, porque não vem de um uso normal do editor.
 */
final class DocumentSanitizer
{
    /** Profundidade máxima aceita (tabelas dentro de listas dentro de citações…). */
    private const MAX_DEPTH = 24;

    /** @return array{type: 'doc', content: list<array<string, mixed>>} */
    public static function empty(): array
    {
        return ['type' => 'doc', 'content' => []];
    }

    /** @return array{type: 'doc', content: list<array<string, mixed>>} */
    public function sanitize(mixed $document): array
    {
        if (! is_array($document) || ($document['type'] ?? null) !== 'doc') {
            return self::empty();
        }

        return ['type' => 'doc', 'content' => $this->children($document['content'] ?? [], 1)];
    }

    /** @return list<array<string, mixed>> */
    private function children(mixed $nodes, int $depth): array
    {
        if (! is_array($nodes) || $depth > self::MAX_DEPTH) {
            return [];
        }

        $clean = [];

        foreach ($nodes as $node) {
            if (is_array($node) && ($result = $this->node($node, $depth)) !== null) {
                $clean[] = $result;
            }
        }

        return $clean;
    }

    /**
     * @param  array<mixed>  $node
     * @return array<string, mixed>|null
     */
    private function node(array $node, int $depth): ?array
    {
        $type = $node['type'] ?? null;

        if (! is_string($type) || $type === 'doc' || ! array_key_exists($type, EditorSchema::NODES)) {
            return null;
        }

        if ($type === 'text') {
            return $this->text($node);
        }

        $clean = ['type' => $type];
        $attrs = $this->attrs($type, is_array($node['attrs'] ?? null) ? $node['attrs'] : []);

        if ($attrs !== []) {
            $clean['attrs'] = $attrs;
        }

        if ($type === 'codeBlock') {
            // Código é texto puro, sem marcas.
            $code = collect(is_array($node['content'] ?? null) ? $node['content'] : [])
                ->filter(fn ($child) => is_array($child) && ($child['type'] ?? null) === 'text' && is_string($child['text'] ?? null))
                ->map(fn (array $child) => ['type' => 'text', 'text' => $child['text']])
                ->values()
                ->all();

            return $code === [] ? $clean : [...$clean, 'content' => $code];
        }

        $content = $this->children($node['content'] ?? [], $depth + 1);

        return $content === [] ? $clean : [...$clean, 'content' => $content];
    }

    /**
     * @param  array<mixed>  $node
     * @return array<string, mixed>|null
     */
    private function text(array $node): ?array
    {
        $text = $node['text'] ?? null;

        if (! is_string($text) || $text === '') {
            return null;
        }

        $marks = [];
        $seen = [];

        foreach (is_array($node['marks'] ?? null) ? $node['marks'] : [] as $mark) {
            $clean = is_array($mark) ? $this->mark($mark) : null;

            if ($clean !== null && ! in_array($clean['type'], $seen, true)) {
                $marks[] = $clean;
                $seen[] = $clean['type'];
            }
        }

        return $marks === [] ? ['type' => 'text', 'text' => $text] : ['type' => 'text', 'text' => $text, 'marks' => $marks];
    }

    /**
     * @param  array<mixed>  $mark
     * @return array{type: string, attrs?: array<string, mixed>}|null
     */
    private function mark(array $mark): ?array
    {
        $type = $mark['type'] ?? null;
        $attrs = is_array($mark['attrs'] ?? null) ? $mark['attrs'] : [];

        return match ($type) {
            'bold', 'italic', 'code' => ['type' => $type],
            'link' => self::safeHref($attrs['href'] ?? null) === null
                ? null
                : ['type' => 'link', 'attrs' => ['href' => self::safeHref($attrs['href'])]],
            'textColor', 'highlight' => in_array($attrs['color'] ?? null, EditorSchema::COLORS, true)
                ? ['type' => $type, 'attrs' => ['color' => $attrs['color']]]
                : null,
            default => null,
        };
    }

    /**
     * @param  array<mixed>  $attrs
     * @return array<string, mixed>
     */
    private function attrs(string $type, array $attrs): array
    {
        $clean = [];

        foreach (EditorSchema::NODES[$type] as $name) {
            $value = $attrs[$name] ?? null;

            $valid = match ($name) {
                'textAlign' => in_array($value, EditorSchema::ALIGNMENTS, true) && $value !== 'left',
                'level' => in_array($value, EditorSchema::HEADING_LEVELS, true),
                'language' => in_array($value, EditorSchema::CODE_LANGUAGES, true),
                'start' => is_int($value) && $value > 1 && $value < 10_000,
                'colspan', 'rowspan' => is_int($value) && $value > 1 && $value <= 20,
            };

            if ($valid) {
                $clean[$name] = $value;
            }
        }

        if ($type === 'heading' && ! isset($clean['level'])) {
            $clean = ['level' => 2, ...$clean];
        }

        return $clean;
    }

    /** Só http, https e mailto: nada de javascript: e afins. */
    public static function safeHref(mixed $href): ?string
    {
        if (! is_string($href)) {
            return null;
        }

        $href = trim($href);

        if (mb_strlen($href) > 2048 || preg_match('#^(https?://[^\s]+|mailto:[^\s@]+@[^\s@]+)$#i', $href) !== 1) {
            return null;
        }

        return $href;
    }
}
