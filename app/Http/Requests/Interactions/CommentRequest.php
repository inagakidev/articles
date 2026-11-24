<?php

namespace App\Http\Requests\Interactions;

use App\Domain\Interactions\Rules\CommentRules;
use Illuminate\Foundation\Http\FormRequest;

/** O texto do comentário (RF-139): até 2.000 caracteres. */
class CommentRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:'.CommentRules::MAX_LENGTH],
            'parent_id' => ['nullable', 'integer'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['body' => __('comments.field')];
    }
}
