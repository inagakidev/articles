<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Audit\Queries\AuditTrail;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Auditoria (prancha "Auditoria", RF-259, RF-291): só consulta e exporta.
 * Não há rota que altere ou apague registros.
 */
class AuditController extends Controller
{
    public function index(Request $request, AuditTrail $trail): Response
    {
        [$search, $action, $days] = $this->filters($request);
        $page = $trail->paginate($search, $action, $days);

        return Inertia::render('admin/audit', [
            'records' => [
                'data' => collect($page->items())->map(fn (AuditLog $log) => $this->row($log)),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
                'from' => $page->firstItem(),
                'to' => $page->lastItem(),
            ],
            'filters' => ['q' => $search, 'acao' => $action?->value, 'periodo' => $days],
            'actions' => collect(AuditAction::cases())->map(fn (AuditAction $case) => [
                'value' => $case->value,
                'label' => __($case->label()),
            ]),
            'periods' => AuditTrail::PERIODS,
        ]);
    }

    /** O mesmo filtro da tela, em CSV, para guardar ou analisar fora. */
    public function export(Request $request, AuditTrail $trail): StreamedResponse
    {
        [$search, $action, $days] = $this->filters($request);

        return response()->streamDownload(function () use ($trail, $search, $action, $days) {
            $out = fopen('php://output', 'w');

            if ($out === false) {
                return;
            }

            fputcsv($out, [__('audit.columns.when'), __('audit.columns.who'), __('audit.columns.action'), __('audit.columns.target'), __('audit.columns.item'), __('audit.columns.reason')]);

            foreach ($trail->all($search, $action, $days) as $log) {
                $row = $this->row($log);
                fputcsv($out, [$row['createdAt'], $row['actor'], $row['action'], $row['target'], $row['item'] ?? '', $row['reason'] ?? '']);
            }

            fclose($out);
        }, 'auditoria-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** @return array{?string, ?AuditAction, ?int} */
    private function filters(Request $request): array
    {
        $search = trim((string) $request->query('q', '')) ?: null;
        $action = AuditAction::tryFrom((string) $request->query('acao', ''));
        $days = in_array((int) $request->query('periodo'), AuditTrail::PERIODS, true) ? (int) $request->query('periodo') : null;

        return [$search, $action, $days];
    }

    /** @return array{id: int, createdAt: string, actor: string, action: string, target: string, item: ?string, reason: ?string} */
    private function row(AuditLog $log): array
    {
        return [
            'id' => $log->id,
            'createdAt' => $log->created_at->toIso8601String(),
            'actor' => $log->actor->name ?? __('audit.system'),
            'action' => __($log->action->label()),
            'target' => $log->subject_label,
            'item' => $log->policy_item,
            'reason' => $log->reason,
        ];
    }
}
