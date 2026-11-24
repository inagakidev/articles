<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

/**
 * A decisão da revisão (RF-249): aprovar, ou rejeitar com o item e a
 * justificativa.
 */
class DecisionRequest extends ModerationRequest
{
    protected function needsReason(): bool
    {
        return $this->input('decision') === 'reject';
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in(['approve', 'reject'])],
            ...parent::rules(),
        ];
    }

    public function approves(): bool
    {
        return $this->validated('decision') === 'approve';
    }
}
