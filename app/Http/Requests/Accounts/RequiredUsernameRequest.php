<?php

namespace App\Http\Requests\Accounts;

use App\Concerns\ProfileValidationRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/** O username novo, com as mesmas regras do cadastro (RF-027 a RF-029). */
class RequiredUsernameRequest extends FormRequest
{
    use ProfileValidationRules;

    protected function prepareForValidation(): void
    {
        // O username é sempre minúsculo (RF-027).
        $this->merge(['username' => Str::lower(trim((string) $this->input('username')))]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['username' => $this->usernameRules($this->user()?->id)];
    }
}
