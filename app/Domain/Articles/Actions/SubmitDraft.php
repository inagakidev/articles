<?php

namespace App\Domain\Articles\Actions;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Exceptions\SubmissionRefused;
use App\Domain\Articles\Rules\SubmissionChecklist;
use App\Domain\Articles\Rules\VersionTransitions;
use App\Models\Article;
use App\Models\ArticleVersion;
use Illuminate\Support\Facades\DB;

/**
 * Envia o rascunho para a revisão (RF-303, RF-344): ele vira o retrato
 * congelado que a administradora analisa (RF-101). Com outra versão já na
 * fila, o envio é recusado (RF-102); o autor retira a anterior antes.
 */
class SubmitDraft
{
    /** @throws SubmissionRefused */
    public function handle(Article $article): ArticleVersion
    {
        return DB::transaction(function () use ($article) {
            // Trava as versões do artigo: dois envios ao mesmo tempo não passam juntos.
            $versions = $article->versions()->lockForUpdate()->get();
            $draft = $versions->firstWhere('status', VersionStatus::Draft);

            if ($draft === null) {
                throw new SubmissionRefused(['draft']);
            }

            if ($versions->contains('status', VersionStatus::Pending)) {
                throw new SubmissionRefused(['pending']);
            }

            $missing = SubmissionChecklist::missing($draft);

            if ($missing !== []) {
                throw new SubmissionRefused($missing);
            }

            VersionTransitions::ensure($draft->status, VersionStatus::Pending);

            $draft->forceFill(['status' => VersionStatus::Pending, 'submitted_at' => now()])->save();
            $article->touch();

            return $draft;
        });
    }
}
