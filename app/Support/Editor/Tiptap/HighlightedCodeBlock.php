<?php

namespace App\Support\Editor\Tiptap;

use Tempest\Highlight\Highlighter;
use Tiptap\Nodes\CodeBlock;

/**
 * Bloco de código colorido no servidor pelo tempest/highlight (D80): a
 * prévia e a página pública saem iguais, sem JavaScript para quem lê.
 */
class HighlightedCodeBlock extends CodeBlock
{
    private static ?Highlighter $highlighter = null;

    /**
     * @param  object{content?: list<object{text?: string}>, attrs?: object{language?: string|null}}  $node
     * @param  array<string, mixed>  $HTMLAttributes
     * @return array{content: string}
     */
    public function renderHTML($node, $HTMLAttributes = [])
    {
        $code = implode('', array_map(fn (object $text) => $text->text ?? '', $node->content ?? []));
        $language = $node->attrs->language ?? null;

        $html = $language === null
            ? htmlspecialchars($code, ENT_QUOTES)
            : (self::$highlighter ??= new Highlighter)->parse($code, $language);

        $label = $language === null ? '' : ' data-language="'.htmlspecialchars($language, ENT_QUOTES).'"';

        return ['content' => "<pre class=\"code-block\"{$label}><code>{$html}</code></pre>"];
    }
}
