<?php

namespace App\Domain\Reports\Actions;

use App\Domain\Reports\Enums\ReportReason;
use App\Domain\Reports\Enums\ReportTarget;
use App\Domain\Reports\Exceptions\ReportRefused;
use App\Domain\Reports\Queries\ReportTargets;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;

/**
 * Denuncia um artigo, comentário ou perfil (RF-164 a RF-169). O conteúdo
 * continua no ar (RF-165). Uma denúncia aberta por pessoa e item, garantida
 * pelo banco; ninguém denuncia o que é seu, mas a autora denuncia
 * comentários no próprio artigo (RF-169).
 */
class SubmitReport
{
    public function __construct(private readonly ReportTargets $targets) {}

    /** @throws ReportRefused */
    public function handle(User $reporter, ReportTarget $target, int $id, ReportReason $reason, ?string $details): Report
    {
        $item = $this->targets->visible($target, $id) ?? throw ReportRefused::notFound();

        if ($this->targets->ownerId($item) === $reporter->id) {
            throw ReportRefused::own();
        }

        try {
            return Report::query()->create([
                'reporter_id' => $reporter->id,
                'target' => $target,
                'target_id' => $item->getKey(),
                'reason' => $reason,
                'details' => $details,
            ]);
        } catch (UniqueConstraintViolationException) {
            throw ReportRefused::alreadyOpen();
        }
    }
}
