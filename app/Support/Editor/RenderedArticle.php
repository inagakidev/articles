<?php

namespace App\Support\Editor;

/** O artigo pronto para ler: o HTML, o sumário e as contagens (RF-070, RF-095, RF-096). */
final readonly class RenderedArticle
{
    /** @param  list<array{id: string, text: string, level: int}>  $toc */
    public function __construct(
        public string $html,
        public array $toc,
        public string $text,
        public int $words,
        public int $characters,
        public int $readingMinutes,
    ) {}
}
