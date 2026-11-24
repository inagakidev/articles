<?php

namespace App\Models;

use App\Domain\Reports\Enums\ReportOutcome;
use App\Domain\Reports\Enums\ReportReason;
use App\Domain\Reports\Enums\ReportStatus;
use App\Domain\Reports\Enums\ReportTarget;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Uma denúncia (RF-164 a RF-175, D91). Não guarda cópia do conteúdo: a
 * administradora analisa o que está no ar agora (RF-174).
 *
 * @property int $id
 * @property int|null $reporter_id
 * @property ReportTarget $target
 * @property int $target_id
 * @property ReportReason $reason
 * @property string|null $details
 * @property ReportStatus $status
 * @property ReportOutcome|null $outcome
 * @property string|null $policy_item
 * @property string|null $justification
 * @property Carbon|null $decided_at
 * @property Carbon $created_at
 */
class Report extends Model
{
    /** @var list<string> */
    protected $guarded = ['id'];

    /** @return BelongsTo<User, $this> */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'target' => ReportTarget::class,
            'reason' => ReportReason::class,
            'status' => ReportStatus::class,
            'outcome' => ReportOutcome::class,
            'open' => 'boolean',
            'decided_at' => 'datetime',
        ];
    }
}
