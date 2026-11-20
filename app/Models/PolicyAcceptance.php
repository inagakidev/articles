<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * O aceite de uma versão dos Termos ou da Privacidade (RF-013).
 *
 * @property int $id
 * @property int $user_id
 * @property int $policy_version_id
 * @property Carbon $accepted_at
 */
#[Fillable(['user_id', 'policy_version_id', 'accepted_at'])]
class PolicyAcceptance extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return ['accepted_at' => 'datetime'];
    }

    /** @return BelongsTo<PolicyVersion, $this> */
    public function policyVersion(): BelongsTo
    {
        return $this->belongsTo(PolicyVersion::class);
    }
}
