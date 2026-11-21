<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

/** E-mail novo de uma conta confirmada (RF-030): válido, livre e diferente do atual. */
class EmailChangeRequest extends FormRequest
{
    use ProfileValidationRules;

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => Str::lower(trim((string) $this->input('email')))]);
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'email' => [...$this->emailRules($this->user()->id), 'different:current_email'],
        ];
    }

    /** @return array<string, mixed> */
    public function validationData(): array
    {
        return [...parent::validationData(), 'current_email' => $this->user()->email];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['email.different' => __('settings.email.same')];
    }
}
