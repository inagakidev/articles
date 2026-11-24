<?php

namespace App\Models;

use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Audit\Exceptions\AuditLogIsAppendOnly;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Um registro de auditoria (RF-291 a RF-293, D87). Só é incluído: alterar
 * ou apagar pelo modelo é recusado. A única remoção será a da tabela de
 * retenção, para contas excluídas (fatia 22).
 *
 * @property int $id
 * @property int|null $actor_id
 * @property AuditAction $action
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property string $subject_label
 * @property string|null $policy_item
 * @property string|null $reason
 * @property array<string, mixed>|null $details
 * @property Carbon $created_at
 */
class AuditLog extends Model
{
    public const UPDATED_AT = null;

    /** @var list<string> */
    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::updating(fn () => throw AuditLogIsAppendOnly::make());
        static::deleting(fn () => throw AuditLogIsAppendOnly::make());
    }

    /** @return BelongsTo<User, $this> */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'action' => AuditAction::class,
            'details' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
