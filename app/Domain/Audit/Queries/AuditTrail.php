<?php

namespace App\Domain\Audit\Queries;

use App\Domain\Audit\Enums\AuditAction;
use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\LazyCollection;

/**
 * O registro de auditoria para consultar e exportar (RF-259), do mais novo
 * para o mais antigo, com busca no alvo, na justificativa e em quem fez.
 */
class AuditTrail
{
    public const PER_PAGE = 25;

    /** Períodos oferecidos, em dias; nulo é todo o histórico. */
    public const PERIODS = [7, 30, 90];

    /** @return LengthAwarePaginator<int, AuditLog> */
    public function paginate(?string $search, ?AuditAction $action, ?int $days): LengthAwarePaginator
    {
        return $this->filtered($search, $action, $days)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();
    }

    /** @return LazyCollection<int, AuditLog> */
    public function all(?string $search, ?AuditAction $action, ?int $days): LazyCollection
    {
        // Pelo id, em blocos: a ordem de inclusão é a mesma da data
        return $this->filtered($search, $action, $days)->lazyByIdDesc(500);
    }

    /** @return Builder<AuditLog> */
    private function filtered(?string $search, ?AuditAction $action, ?int $days): Builder
    {
        return AuditLog::query()
            ->with('actor:id,name,username')
            ->when($action, fn (Builder $query, AuditAction $action) => $query->where('action', $action))
            ->when($days, fn (Builder $query, int $days) => $query->where('created_at', '>=', now()->subDays($days)))
            ->when($search, function (Builder $query, string $search) {
                $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search).'%';
                $query->where(fn (Builder $match) => $match
                    ->where('subject_label', 'like', $like)
                    ->orWhere('reason', 'like', $like)
                    ->orWhereHas('actor', fn (Builder $actor) => $actor->where('name', 'like', $like)->orWhere('username', 'like', $like)));
            });
    }
}
