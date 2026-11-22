<?php

namespace App\Support\Editor\Tiptap;

use Tiptap\Core\Mark;

/**
 * Cor de texto da paleta (RF-068, D58). Grava só o nome; a cor de cada
 * tema vem de uma classe do app.css.
 */
class PaletteColor extends Mark
{
    /** @var string */
    public static $name = 'textColor';

    /** @return array<string, mixed> */
    public function addAttributes()
    {
        return ['color' => []];
    }

    /**
     * @param  object{attrs?: object{color?: string}}  $mark
     * @param  array<string, mixed>  $HTMLAttributes
     * @return array<int, mixed>
     */
    public function renderHTML($mark, $HTMLAttributes = [])
    {
        return ['span', ['class' => 'article-color-'.($mark->attrs->color ?? '')], 0];
    }
}
