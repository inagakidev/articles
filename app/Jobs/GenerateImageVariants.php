<?php

namespace App\Jobs;

use App\Models\ArticleImage;
use App\Support\Images\ImageProcessor;
use App\Support\Media\MediaDelivery;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Gera as larguras menores de uma imagem de artigo (RF-084, D52). Só as
 * menores que o original: uma imagem de 800 px fica com 480 e o original.
 */
class GenerateImageVariants implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** Imagem apagada antes da fila chegar nela: nada a fazer. */
    public bool $deleteWhenMissingModels = true;

    public function __construct(public ArticleImage $image) {}

    public function handle(ImageProcessor $images, MediaDelivery $media): void
    {
        $disk = $media->disk();
        $original = $disk->get($this->image->path());

        if ($original === null) {
            return;
        }

        $done = [];

        foreach (ArticleImage::WIDTHS as $width) {
            if ($width >= $this->image->width) {
                break;
            }

            $disk->put($this->image->path($width), $images->resizeToWidth($original, $width));
            $done[] = $width;
        }

        $this->image->forceFill(['variants' => $done])->save();
    }
}
