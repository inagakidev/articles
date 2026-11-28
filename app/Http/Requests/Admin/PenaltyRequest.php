<?php

namespace App\Http\Requests\Admin;

use App\Domain\Moderation\Rules\PenaltyRules;
use Illuminate\Validation\Rule;

/**
 * Aplicar uma penalidade (RF-254, RF-255, D92): o item da Política e a
 * justificativa, que vão no e-mail para a pessoa; na suspensão, a duração
 * (7, 15 ou 30 dias).
 */
class PenaltyRequest extends ModerationRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'days' => [Rule::requiredIf($this->wantsSuspension()), 'nullable', 'integer', Rule::in(PenaltyRules::SUSPENSION_DAYS)],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [...parent::attributes(), 'days' => __('moderation.penalties.days')];
    }

    public function wantsSuspension(): bool
    {
        return $this->routeIs('admin.users.suspend');
    }
}
