<?php

namespace App\Domain\Reports\Actions;

use App\Domain\Reports\Enums\ReportStatus;
use App\Domain\Reports\Enums\ReportTarget;
use App\Models\Report;

/**
 * Conteúdo excluído antes da análise encerra as denúncias abertas dele com
 * "conteúdo removido" (RF-175).
 */
class CloseRemovedReports
{
    /** @param  list<int>  $ids */
    public function handle(ReportTarget $target, array $ids): void
    {
        if ($ids === []) {
            return;
        }

        Report::query()
            ->where('status', ReportStatus::Open)
            ->where('target', $target)
            ->whereIn('target_id', $ids)
            ->update(['status' => ReportStatus::Removed, 'open' => null, 'decided_at' => now()]);
    }
}
