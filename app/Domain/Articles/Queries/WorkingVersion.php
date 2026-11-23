<?php

namespace App\Domain\Articles\Queries;

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;

/**
 * A versão que o autor tem em mãos, sem criar nada (D82): o rascunho, se
 * houver; senão, a pendente (RF-103), a em vigor ou a última rejeitada.
 * É o que o editor e a prévia mostram; o rascunho só nasce ao salvar.
 */
class WorkingVersion
{
    public const BASES = [VersionStatus::Pending, VersionStatus::Approved, VersionStatus::Rejected];

    public function for(Article $article): ?ArticleVersion
    {
        return $this->draft($article) ?? $this->base($article);
    }

    public function draft(Article $article): ?ArticleVersion
    {
        return $article->versions()->where('status', VersionStatus::Draft)->first();
    }

    /** A versão de onde um rascunho novo parte. */
    public function base(Article $article): ?ArticleVersion
    {
        foreach (self::BASES as $status) {
            $version = $article->versions()->where('status', $status)->latest('id')->first();

            if ($version !== null) {
                return $version;
            }
        }

        return null;
    }
}
