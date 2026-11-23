<?php

namespace App\Support\Images;

/** Uma imagem já regravada, com as dimensões finais. */
final readonly class ProcessedImage
{
    public function __construct(
        public string $contents,
        public int $width,
        public int $height,
    ) {}
}
