<?php

namespace App\Http\Requests\Admin;

use App\Domain\Moderation\Rules\PenaltyRules;
use App\Domain\Reports\Enums\ReportOutcome;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * A decisão sobre as denúncias de um item (RF-171, RF-173): o desfecho e a
 * justificativa sempre; o item da Política só quando procedente; no
 * perfil, ao menos uma coisa a redefinir.
 */
class ReportDecisionRequest extends ModerationRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['policy_item'][0] = $this->dismissing() ? 'nullable' : 'required';

        return [
            ...$rules,
            'outcome' => ['required', Rule::enum(ReportOutcome::class)],
            'photo' => ['boolean'],
            'bio' => ['boolean'],
            'username' => ['boolean'],
            // Procedente com penalidade: suspende quem escreveu (D92)
            'penalty_days' => ['nullable', 'integer', Rule::in(PenaltyRules::SUSPENSION_DAYS), Rule::prohibitedIf($this->dismissing())],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator) {
            if ($this->input('outcome') === ReportOutcome::ModerateProfile->value
                && ! $this->boolean('photo') && ! $this->boolean('bio') && ! $this->boolean('username')) {
                $validator->errors()->add('outcome', __('reports.admin.reset_required'));
            }
        }];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [...parent::attributes(), 'reason' => __('reports.admin.justification'), 'penalty_days' => __('penalties.fields.days')];
    }

    private function dismissing(): bool
    {
        return $this->input('outcome') === ReportOutcome::Dismiss->value;
    }
}
