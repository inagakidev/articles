<?php

namespace App\Support\Media;

use App\Models\ArticleImage;
use App\Support\Editor\ImageSource;
use Illuminate\Support\Collection;

/**
 * Monta as URLs de cada imagem do artigo para o renderer e o editor: as
 * larguras já geradas mais o original, todas pela rota `media.show`.
 */
class ArticleImageSources
{
    /**
     * @param  Collection<int, ArticleImage>  $images
     * @return array<string, ImageSource>
     */
    public function for(Collection $images): array
    {
        return $images->mapWithKeys(fn (ArticleImage $image) => [$image->uuid => $this->source($image)])->all();
    }

    public function source(ArticleImage $image): ImageSource
    {
        $widths = [];

        foreach ($image->variants ?? [] as $width) {
            $widths[$width] = self::url($image->path($width));
        }

        $widths[$image->width] = self::url($image->path());

        return new ImageSource(
            src: self::url($image->pathFor(960)),
            widths: count($widths) > 1 ? $widths : [],
            width: $image->width,
            height: $image->height,
        );
    }

    public static function url(string $path): string
    {
        return route('media.show', ['path' => $path], absolute: false);
    }
}
