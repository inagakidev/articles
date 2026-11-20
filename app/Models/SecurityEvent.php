<?php

namespace App\Models;

use App\Domain\Accounts\Enums\SecurityEventType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property SecurityEventType $type
 * @property string|null $email
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property Carbon $created_at
 */
#[Fillable(['user_id', 'type', 'email', 'ip_address', 'user_agent'])]
class SecurityEvent extends Model
{
    use MassPrunable;

    /** Eventos só são incluídos, nunca alterados (REQUIREMENTS.md RF-243). */
    public const UPDATED_AT = null;

    /** Prazo das tentativas suspeitas de login (REQUIREMENTS.md §2.23). */
    public const LOGIN_ATTEMPT_RETENTION_DAYS = 90;

    protected function casts(): array
    {
        return [
            'type' => SecurityEventType::class,
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Apagados pelo `model:prune`, agendado em routes/console.php.
     *
     * @return Builder<static>
     */
    public function prunable(): Builder
    {
        return static::query()
            ->whereIn('type', SecurityEventType::loginAttempts())
            ->where('created_at', '<', now()->subDays(self::LOGIN_ATTEMPT_RETENTION_DAYS));
    }
}
