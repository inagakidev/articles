<?php

namespace App\Http\Requests\Admin;

class PenaltyRequest extends ModerationRequest
{
    public function rules(): array
    {
        $rules = parent::rules();

        return [
            ...$rules,
            'days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ];
    }

    public function wantsSuspension(): bool
    {
        return $this->routeIs('admin.users.suspend');
    }
}
