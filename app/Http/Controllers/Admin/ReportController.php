<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Moderation\Queries\ContentPolicyItems;
use App\Domain\Reports\Actions\DecideReport;
use App\Domain\Reports\Enums\ReportOutcome;
use App\Domain\Reports\Enums\ReportStatus;
use App\Domain\Reports\Enums\ReportTarget;
use App\Domain\Reports\Exceptions\ReportRefused;
use App\Domain\Reports\Queries\ReportQueue;
use App\Domain\Reports\Queries\ReportTargets;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportDecisionRequest;
use App\Http\Resources\Reports\ReportedItem;
use App\Models\Report;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Denúncias no painel (prancha "Admin · Denúncias", RF-252): a lista por
 * item, a análise do conteúdo como está agora e a decisão, que vale para
 * todas as denúncias abertas do item.
 */
class ReportController extends Controller
{
    /** Abas do endereço (`status`) para cada status. */
    public const STATUSES = [
        'abertas' => ReportStatus::Open,
        'procedentes' => ReportStatus::Upheld,
        'improcedentes' => ReportStatus::Dismissed,
        'removidas' => ReportStatus::Removed,
    ];

    /** Filtro de tipo do endereço (`tipo`). */
    public const TARGETS = [
        'artigos' => ReportTarget::Article,
        'comentarios' => ReportTarget::Comment,
        'perfis' => ReportTarget::Profile,
    ];

    public function __construct(
        private readonly ReportQueue $queue,
        private readonly ReportTargets $targets,
        private readonly ReportedItem $items,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/reports', $this->listing($request));
    }

    public function show(Request $request, string $target, int $id, ContentPolicyItems $policy): Response
    {
        $target = ReportTarget::from($target);
        $reports = $this->queue->forItem($target, $id);
        $first = $reports->first();
        abort_if($first === null, 404);

        $open = $first->status === ReportStatus::Open;

        return Inertia::render('admin/reports', [
            ...$this->listing($request),
            'selected' => [
                'target' => $target->value,
                'id' => $id,
                'item' => $this->items->for($target, $this->targets->current($target, $id)),
                'status' => $first->status->value,
                'reasons' => $reports->countBy(fn (Report $report) => $report->reason->value)->all(),
                // Os detalhes escritos, sem dizer quem denunciou
                'details' => $reports->pluck('details')->filter()->values()->all(),
                'count' => $reports->count(),
                'outcomes' => $open ? array_map(fn (ReportOutcome $outcome) => $outcome->value, ReportOutcome::for($target)) : [],
                'decision' => $open ? null : [
                    'outcome' => $first->outcome?->value,
                    'policyItem' => $first->policy_item,
                    'justification' => $first->justification,
                    'decidedAt' => $first->decided_at?->toIso8601String(),
                ],
            ],
            'policyItems' => $policy->all(),
            'neighbours' => $open ? $this->queue->neighbours($target, $id) : ['previous' => null, 'next' => null],
        ]);
    }

    public function decide(ReportDecisionRequest $request, string $target, int $id, DecideReport $decide): RedirectResponse
    {
        $target = ReportTarget::from($target);

        try {
            $decide->handle(
                $target,
                $id,
                $request->user(),
                ReportOutcome::from($request->validated('outcome')),
                $request->validated('policy_item'),
                $request->validated('reason'),
                ['photo' => $request->boolean('photo'), 'bio' => $request->boolean('bio'), 'username' => $request->boolean('username')],
            );
        } catch (ReportRefused $refused) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __($refused->getMessage())]);

            return to_route('admin.reports');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('reports.admin.decided')]);
        $next = $this->queue->neighbours($target, $id)['next'];

        return $next === null
            ? to_route('admin.reports')
            : to_route('admin.reports.show', $next);
    }

    /** @return array<string, mixed> */
    private function listing(Request $request): array
    {
        $statusParam = array_key_exists((string) $request->query('status'), self::STATUSES) ? (string) $request->query('status') : 'abertas';
        $typeParam = array_key_exists((string) $request->query('tipo'), self::TARGETS) ? (string) $request->query('tipo') : null;
        $page = $this->queue->groups(self::STATUSES[$statusParam], $typeParam === null ? null : self::TARGETS[$typeParam], $request->integer('page', 1));

        return [
            'filters' => ['status' => $statusParam, 'tipo' => $typeParam],
            'openCount' => $this->queue->openCount(),
            'groups' => [
                'data' => collect($page->items())->map(fn (Report $group) => [
                    'target' => $group->target->value,
                    'id' => $group->target_id,
                    'count' => (int) $group->getAttribute('reports_count'),
                    'since' => $group->getAttribute('first_at'),
                    'reasons' => Report::query()
                        ->where('target', $group->target)
                        ->where('target_id', $group->target_id)
                        ->where('status', self::STATUSES[$statusParam])
                        ->pluck('reason')
                        ->map(fn ($reason) => $reason->value)
                        ->unique()
                        ->values()
                        ->all(),
                    'item' => $this->items->for($group->target, $this->targets->current($group->target, $group->target_id)),
                ])->all(),
                'currentPage' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ];
    }
}
