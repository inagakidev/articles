<?php

namespace App\Models;

use App\Domain\Moderation\Enums\AppealStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $penalty_id
 * @property int $user_id
 * @property AppealStatus $status
 * @property Carbon|null $decided_at
 */
class Appeal extends Model
{
    protected $guarded = ['id'];

    /** @return BelongsTo<Penalty, $this> */
    public function penalty(): BelongsTo
    {
        return $this->belongsTo(Penalty::class);
    }

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

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'status' => AppealStatus::class,
            'decided_at' => 'datetime',
            'reopen_deadline_at' => 'datetime',
        ];
    }
}
