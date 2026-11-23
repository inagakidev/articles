<?php

namespace App\Support\Images;

use Illuminate\Http\UploadedFile;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Interfaces\ImageManagerInterface;

/**
 * O único ponto que usa o Intervention Image (D52). A imagem é lida,
 * desvirada pela orientação da câmera e regravada em WebP, o que descarta
 * EXIF, GPS e o modelo do aparelho.
 */
class ImageProcessor
{
    /** Lado da foto de perfil; mostrada até 120 px, com folga para telas densas. */
    public const AVATAR_SIZE = 512;

    /** Maior lado guardado do original; acima disso não há tela que aproveite. */
    public const ORIGINAL_MAX = 3200;

    private const QUALITY = 82;

    /**
     * Memória para abrir a maior imagem aceita (50 MP, ~4 bytes por pixel)
     * e gerar a cópia reduzida. Vale só para a requisição ou o job que
     * processa, sem mudar o padrão do servidor.
     */
    private const MEMORY = '512M';

    private ImageManagerInterface $manager;

    public function __construct()
    {
        $this->manager = ImageManager::usingDriver(Driver::class);
    }

    /** Foto de perfil: recorte quadrado pelo centro, em WebP, sem metadados. */
    public function avatar(UploadedFile $file): string
    {
        return (string) $this->manager
            ->decodePath($file->getRealPath())
            ->orient()
            ->cover(self::AVATAR_SIZE, self::AVATAR_SIZE)
            ->encode(new WebpEncoder(quality: self::QUALITY, strip: true));
    }

    /** Imagem de artigo: o original desvirado, limitado e regravado sem metadados. */
    public function articleOriginal(UploadedFile $file): ProcessedImage
    {
        self::ensureMemory();

        $image = $this->manager
            ->decodePath($file->getRealPath())
            ->orient()
            ->scaleDown(self::ORIGINAL_MAX, self::ORIGINAL_MAX);

        return new ProcessedImage(
            contents: (string) $image->encode(new WebpEncoder(quality: self::QUALITY, strip: true)),
            width: $image->width(),
            height: $image->height(),
        );
    }

    /** Uma largura derivada do original, sem aumentar imagens menores. */
    public function resizeToWidth(string $contents, int $width): string
    {
        return (string) $this->manager
            ->decodeBinary($contents)
            ->scaleDown(width: $width)
            ->encode(new WebpEncoder(quality: self::QUALITY, strip: true));
    }

    private static function ensureMemory(): void
    {
        $current = (string) ini_get('memory_limit');

        if ($current !== '-1' && self::bytes($current) < self::bytes(self::MEMORY)) {
            ini_set('memory_limit', self::MEMORY);
        }
    }

    /** "128M" → bytes, no formato do php.ini. */
    private static function bytes(string $value): int
    {
        $number = (int) $value;

        return match (strtoupper(substr(trim($value), -1))) {
            'G' => $number * 1024 ** 3,
            'M' => $number * 1024 ** 2,
            'K' => $number * 1024,
            default => $number,
        };
    }
}
