<?php

namespace App\Http\Requests\Articles;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

/**
 * Imagem enviada para o artigo (RF-081, RF-083, RF-085): JPG, PNG ou
 * WebP, até 10 MB. SVG e GIF ficam de fora. O limite de pixels barra
 * arquivos pequenos que viram imagens enormes ao serem abertos.
 */
class ArticleImageRequest extends FormRequest
{
    public const MAX_KILOBYTES = 10 * 1024;

    /** 50 megapixels: cobre câmeras e celulares, e cabe na memória do processamento. */
    public const MAX_PIXELS = 50_000_000;

    /** @return array<string, array<int, Closure|string>> */
    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:'.self::MAX_KILOBYTES,
                $this->pixelLimit(),
            ],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['image' => __('editor.image.label')];
    }

    private function pixelLimit(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            $size = $value instanceof UploadedFile ? @getimagesize($value->getRealPath()) : false;

            if ($size === false || $size[0] * $size[1] > self::MAX_PIXELS) {
                $fail(__('editor.image.too_many_pixels', ['max' => self::MAX_PIXELS / 1_000_000]));
            }
        };
    }
}
