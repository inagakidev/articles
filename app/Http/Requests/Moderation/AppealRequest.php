<?php

namespace App\Http\Requests\Moderation;

use Illuminate\Foundation\Http\FormRequest;

class AppealRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'justification' => ['required', 'string', 'min:20', 'max:5000'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['justification' => __('moderation.appeals.justification')];
    }
}
