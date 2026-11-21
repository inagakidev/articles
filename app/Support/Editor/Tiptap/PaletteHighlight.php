<?php

namespace App\Support\Editor\Tiptap;

use Tiptap\Core\Mark;

/** Destaque da paleta (RF-068, D58): só o nome, com a cor de cada tema no app.css. */
class PaletteHighlight extends Mark
{
    /** @var string */
    public static $name = 'highlight';

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
        return ['mark', ['class' => 'article-highlight-'.($mark->attrs->color ?? '')], 0];
    }
}
