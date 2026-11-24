<?php

namespace App\Http\Controllers\Reports;

use App\Domain\Reports\Actions\SubmitReport;
use App\Domain\Reports\Enums\ReportReason;
use App\Domain\Reports\Enums\ReportTarget;
use App\Domain\Reports\Exceptions\ReportRefused;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\ReportRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/** Denunciar um artigo, comentário ou perfil (RF-164 a RF-169, D91). */
class ReportController extends Controller
{
    public function store(ReportRequest $request, SubmitReport $submit): RedirectResponse
    {
        $details = trim((string) $request->validated('details'));

        try {
            $submit->handle(
                $request->user(),
                ReportTarget::from($request->validated('target')),
                (int) $request->validated('id'),
                ReportReason::from($request->validated('reason')),
                $details === '' ? null : $details,
            );
        } catch (ReportRefused $refused) {
            throw ValidationException::withMessages(['reason' => __($refused->getMessage())]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('reports.sent')]);

        return back();
    }
}
