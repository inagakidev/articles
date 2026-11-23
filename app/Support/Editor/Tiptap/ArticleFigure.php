<?php

namespace App\Support\Editor\Tiptap;

use App\Support\Editor\ImageSource;
use Tiptap\Core\Node;

/**
 * Imagem no texto (RF-080, RF-087, RF-088): figura com tamanhos variados,
 * texto alternativo (vazio quando decorativa) e legenda opcional. Imagem
 * que o artigo não tem não aparece.
 */
class ArticleFigure extends Node
{
    /** @var string */
    public static $name = 'image';

    /** Largura de leitura do texto, para o navegador escolher o tamanho. */
    private const SIZES = '(min-width: 768px) 720px, 100vw';

    /**
     * @param  array<string, ImageSource>  $sources
     */
    public function __construct(private array $sources = [])
    {
        parent::__construct();
    }

    /**
     * @param  object{attrs?: object{id?: string, alt?: string, caption?: string, decorative?: bool}}  $node
     * @param  array<string, mixed>  $HTMLAttributes
     * @return array{content: string}
     */
    public function renderHTML($node, $HTMLAttributes = [])
    {
        $attrs = $node->attrs ?? (object) [];
        $source = $this->sources[$attrs->id ?? ''] ?? null;

        if ($source === null) {
            return ['content' => ''];
        }

        $e = fn (string $value) => htmlspecialchars($value, ENT_QUOTES);
        $alt = ($attrs->decorative ?? false) ? '' : ($attrs->alt ?? '');
        $srcset = $source->widths === [] ? '' : ' srcset="'.$e($source->srcset()).'" sizes="'.self::SIZES.'"';
        $img = "<img src=\"{$e($source->src)}\"{$srcset} alt=\"{$e($alt)}\" width=\"{$source->width}\" height=\"{$source->height}\" loading=\"lazy\" decoding=\"async\">";
        $caption = isset($attrs->caption) ? "<figcaption>{$e($attrs->caption)}</figcaption>" : '';

        return ['content' => "<figure class=\"article-figure\">{$img}{$caption}</figure>"];
    }
}
