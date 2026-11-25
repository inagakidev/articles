<?php

namespace App\Models;

use App\Domain\Moderation\Enums\PenaltyType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $decided_by_id
 * @property PenaltyType $type
 * @property string $policy_item
 * @property string $reason
 * @property Carbon $starts_at
 * @property Carbon|null $ends_at
 * @property Carbon|null $appeal_deadline_at
 * @property Carbon|null $ended_at
 */
class Penalty extends Model
{
    protected $guarded = ['id'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function decidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by_id');
    }

    /** @return HasOne<Appeal, $this> */
    public function appeal(): HasOne
    {
        return $this->hasOne(Appeal::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'type' => PenaltyType::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'appeal_deadline_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }
}
