<?php

namespace App\Http\Requests\Admin;

use App\Domain\Moderation\Queries\ContentPolicyItems;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Item da Política de conteúdo e justificativa (RF-107, RF-111, RF-122):
 * obrigatórios para rejeitar, despublicar e excluir de vez.
 */
class ModerationRequest extends FormRequest
{
    public const REASON_MIN = 10;

    public const REASON_MAX = 2000;

    /** Quando a decisão pode ser outra além da recusa (a revisão aprova). */
    protected function needsReason(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $required = $this->needsReason() ? 'required' : 'nullable';

        return [
            'policy_item' => [$required, 'string', Rule::in(app(ContentPolicyItems::class)->ids())],
            'reason' => [$required, 'string', 'min:'.self::REASON_MIN, 'max:'.self::REASON_MAX],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'policy_item' => __('moderation.fields.policy_item'),
            'reason' => __('moderation.fields.reason'),
        ];
    }
}
