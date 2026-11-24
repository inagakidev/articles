<?php

namespace App\Domain\Articles\Actions;

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use Illuminate\Support\Facades\DB;

/**
 * Manda o artigo para a lixeira (RF-116, RF-340). Uma versão na fila sai
 * dela e volta a rascunho (RF-123, A21). Se já há um rascunho, fica o mais
 * novo, que é o trabalho mais recente da autora, e a versão da fila é
 * descartada (D87). Na restauração, o artigo volta com esse rascunho.
 */
class TrashArticle
{
    public function handle(Article $article): void
    {
        DB::transaction(function () use ($article) {
            $pending = ArticleVersion::query()
                ->where('article_id', $article->id)
                ->where('status', VersionStatus::Pending)
                ->lockForUpdate()
                ->first();

            if ($pending !== null) {
                $hasDraft = ArticleVersion::query()
                    ->where('article_id', $article->id)
                    ->where('status', VersionStatus::Draft)
                    ->exists();

                $hasDraft
                    ? $pending->delete()
                    : $pending->forceFill(['status' => VersionStatus::Draft, 'submitted_at' => null])->save();
            }

            $article->delete();
        });
    }
}
