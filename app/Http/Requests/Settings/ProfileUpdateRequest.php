<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/** Perfil público: nome, username e bio (RF-026). E-mail e foto têm o próprio fluxo. */
class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /** Bio curta, como a da prancha (cabe em três linhas no perfil). */
    public const BIO_MAX = 300;

    protected function prepareForValidation(): void
    {
        // O username é sempre minúsculo (RF-027).
        $this->merge([
            'username' => Str::lower(trim((string) $this->input('username'))),
            'bio' => is_string($this->input('bio')) ? trim($this->input('bio')) : null,
        ]);
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'name' => $this->nameRules(),
            'username' => $this->usernameRules($this->user()->id),
            'bio' => ['nullable', 'string', 'max:'.self::BIO_MAX],
        ];
    }
}
