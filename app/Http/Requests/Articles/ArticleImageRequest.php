<?php

namespace App\Http\Requests\Articles;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Imagem enviada para o artigo (RF-081, RF-083, RF-085): JPG, PNG ou
 * WebP, até 10 MB. SVG e GIF ficam de fora. O limite de lados barra
 * imagens que estourariam a memória ao serem abertas.
 */
class ArticleImageRequest extends FormRequest
{
    public const MAX_KILOBYTES = 10 * 1024;

    public const MAX_SIDE = 12_000;

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:'.self::MAX_KILOBYTES,
                'dimensions:max_width='.self::MAX_SIDE.',max_height='.self::MAX_SIDE,
            ],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['image' => __('editor.image.label')];
    }
}
