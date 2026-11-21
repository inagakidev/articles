<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

/** Foto de perfil: JPG, PNG ou WebP (RF-032), até 10 MB, como as imagens dos artigos (D52). */
class AvatarUpdateRequest extends FormRequest
{
    public const MAX_KB = 10 * 1024;

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'avatar' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'webp'])->max(self::MAX_KB),
                'dimensions:min_width=96,min_height=96',
            ],
        ];
    }
}
