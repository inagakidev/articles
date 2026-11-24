<?php

namespace App\Domain\Reports\Queries;

use App\Domain\Reports\Enums\ReportStatus;
use App\Domain\Reports\Enums\ReportTarget;
use App\Models\Report;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * As denúncias do painel, agrupadas por item (RF-252): várias pessoas
 * denunciando a mesma coisa viram uma linha só, decidida de uma vez. As
 * abertas vêm das mais denunciadas para as menos, e das mais antigas.
 */
class ReportQueue
{
    public const PER_PAGE = 20;

    /** @return LengthAwarePaginator<int, Report> */
    public function groups(ReportStatus $status, ?ReportTarget $target, int $page = 1): LengthAwarePaginator
    {
        return $this->grouped($status, $target)->paginate(self::PER_PAGE, page: $page);
    }

    /** Itens com denúncia aberta, para a lateral e o painel (RF-262). */
    public function openCount(): int
    {
        return DB::query()
            ->fromSub(Report::query()->select('target', 'target_id')->where('status', ReportStatus::Open)->groupBy('target', 'target_id'), 'items')
            ->count();
    }

    /**
     * As denúncias de um item: as abertas; sem abertas, as da última decisão.
     *
     * @return Collection<int, Report>
     */
    public function forItem(ReportTarget $target, int $id): Collection
    {
        $reports = Report::query()->where('target', $target)->where('target_id', $id)->oldest()->get();
        $open = $reports->where('status', ReportStatus::Open);

        if ($open->isNotEmpty()) {
            return $open->values();
        }

        $last = $reports->max('decided_at');

        return $reports->filter(fn (Report $report) => $report->decided_at?->equalTo($last) ?? false)->values();
    }

    /**
     * O item aberto antes e depois deste, na ordem da fila (J e K).
     *
     * @return array{previous: array{target: string, id: int}|null, next: array{target: string, id: int}|null}
     */
    public function neighbours(ReportTarget $target, int $id): array
    {
        $keys = $this->grouped(ReportStatus::Open, null)->get()
            ->map(fn (Report $group) => ['target' => $group->target->value, 'id' => $group->target_id])
            ->values();
        $index = $keys->search(fn (array $key) => $key['target'] === $target->value && $key['id'] === $id);

        if ($index === false) {
            return ['previous' => null, 'next' => $keys->first()];
        }

        return ['previous' => $keys->get($index - 1), 'next' => $keys->get($index + 1)];
    }

    /**
     * Quais destes itens a pessoa já denunciou e ainda estão em análise.
     *
     * @param  list<int>  $ids
     * @return list<int>
     */
    public function openBy(User $reporter, ReportTarget $target, array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        return array_values(Report::query()
            ->where('reporter_id', $reporter->id)
            ->where('status', ReportStatus::Open)
            ->where('target', $target)
            ->whereIn('target_id', $ids)
            ->pluck('target_id')
            ->map(intval(...))
            ->all());
    }

    /** @return Builder<Report> */
    private function grouped(ReportStatus $status, ?ReportTarget $target): Builder
    {
        return Report::query()
            ->select('target', 'target_id')
            ->selectRaw('count(*) as reports_count, min(created_at) as first_at, max(decided_at) as last_decided_at')
            ->where('status', $status)
            ->when($target, fn (Builder $query, ReportTarget $target) => $query->where('target', $target))
            ->groupBy('target', 'target_id')
            ->when(
                $status === ReportStatus::Open,
                fn (Builder $query) => $query->orderByDesc('reports_count')->orderBy('first_at'),
                fn (Builder $query) => $query->orderByDesc('last_decided_at'),
            )
            ->orderBy('target')
            ->orderBy('target_id');
    }
}
