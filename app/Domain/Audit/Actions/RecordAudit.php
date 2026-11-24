<?php

namespace App\Domain\Audit\Actions;

use App\Domain\Audit\Enums\AuditAction;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Inclui um registro na auditoria (RF-293). Quem chama descreve o alvo em
 * texto ("“Título” de @username"), porque o alvo pode deixar de existir.
 * Nunca guarda o conteúdo de um artigo.
 */
class RecordAudit
{
    /** @param  array<string, mixed>  $details */
    public function handle(
        ?User $actor,
        AuditAction $action,
        string $label,
        ?Model $subject = null,
        ?string $policyItem = null,
        ?string $reason = null,
        array $details = [],
    ): AuditLog {
        return AuditLog::query()->create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'subject_type' => $subject === null ? null : class_basename($subject),
            'subject_id' => $subject?->getKey(),
            'subject_label' => mb_substr($label, 0, 255),
            'policy_item' => $policyItem,
            'reason' => $reason,
            'details' => $details === [] ? null : $details,
        ]);
    }
}
