<?php

namespace App\Http\Requests\Reports;

use App\Domain\Reports\Enums\ReportReason;
use App\Domain\Reports\Enums\ReportTarget;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** O item, o motivo e os detalhes da denúncia (RF-166); "outro" pede detalhes. */
class ReportRequest extends FormRequest
{
    public const DETAILS_MAX = 500;

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'target' => ['required', Rule::enum(ReportTarget::class)],
            'id' => ['required', 'integer'],
            'reason' => ['required', Rule::enum(ReportReason::class)],
            'details' => ['nullable', 'string', 'max:'.self::DETAILS_MAX, Rule::requiredIf($this->input('reason') === ReportReason::Other->value)],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'reason' => __('reports.fields.reason'),
            'details' => __('reports.fields.details'),
        ];
    }
}
