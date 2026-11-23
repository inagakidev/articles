<?php

namespace App\Domain\Articles\Actions;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Exceptions\WithdrawalNeedsChoice;
use App\Domain\Articles\Rules\VersionTransitions;
use App\Models\Article;
use App\Models\ArticleVersion;
use Illuminate\Support\Facades\DB;

/**
 * Retira a versão pendente da fila (RF-103, RF-104, RF-345): ela volta a
 * ser o rascunho. Se já existe um rascunho, o autor escolhe qual manter, e
 * o outro é descartado; sem a escolha, nada muda.
 */
class WithdrawPending
{
    public const KEEP_DRAFT = 'draft';

    public const KEEP_PENDING = 'pending';

    /**
     * @param  self::KEEP_*|null  $keep
     *
     * @throws WithdrawalNeedsChoice
     */
    public function handle(Article $article, ?string $keep = null): ?ArticleVersion
    {
        return DB::transaction(function () use ($article, $keep) {
            $versions = $article->versions()->lockForUpdate()->get();
            $pending = $versions->firstWhere('status', VersionStatus::Pending);
            $draft = $versions->firstWhere('status', VersionStatus::Draft);

            // Já saiu da fila (outra aba, ou a decisão saiu antes): nada a fazer.
            if ($pending === null) {
                return null;
            }

            if ($draft !== null && $keep === null) {
                throw new WithdrawalNeedsChoice;
            }

            if ($draft !== null && $keep === self::KEEP_DRAFT) {
                $pending->delete();
                $article->touch();

                return $draft;
            }

            $draft?->delete();
            VersionTransitions::ensure($pending->status, VersionStatus::Draft);
            $pending->forceFill(['status' => VersionStatus::Draft, 'submitted_at' => null])->save();
            $article->touch();

            return $pending;
        });
    }
}
