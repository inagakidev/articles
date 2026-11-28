<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AppealDecisionRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'accepted' => ['required', 'boolean'],
            'reason' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'accepted' => __('moderation.appeals.decision'),
            'reason' => __('moderation.appeals.reason'),
        ];
    }
}
