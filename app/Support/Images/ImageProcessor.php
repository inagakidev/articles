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

    private const QUALITY = 82;

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
}
