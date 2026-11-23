<?php

namespace App\Support\Editor;

/** Onde o navegador busca uma imagem do artigo e o tamanho dela. */
final readonly class ImageSource
{
    /** @param  array<int, string>  $widths  largura → URL */
    public function __construct(
        public string $src,
        public array $widths,
        public int $width,
        public int $height,
    ) {}

    public function srcset(): string
    {
        return implode(', ', array_map(fn (int $width, string $url) => "{$url} {$width}w", array_keys($this->widths), $this->widths));
    }
}
