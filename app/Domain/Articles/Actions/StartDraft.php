<?php

namespace App\Domain\Articles\Actions;

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use Illuminate\Support\Facades\DB;

/**
 * O rascunho que o editor abre (RF-343, RF-329, RF-349). Se ainda não
 * existe, nasce como cópia da versão mais útil: a pendente (o autor segue
 * editando enquanto ela espera, RF-103), a em vigor ou a última rejeitada.
 */
class StartDraft
{
    private const BASES = [VersionStatus::Pending, VersionStatus::Approved, VersionStatus::Rejected];

    public function handle(Article $article): ArticleVersion
    {
        return DB::transaction(function () use ($article) {
            $existing = $article->versions()->where('status', VersionStatus::Draft)->lockForUpdate()->first();

            if ($existing !== null) {
                return $existing;
            }

            $base = $this->base($article);
            $draft = $article->versions()->create($base === null ? [] : [
                'title' => $base->title,
                'content' => $base->content,
                'content_text' => $base->content_text,
                'language' => $base->language,
                'category_id' => $base->category_id,
            ]);

            if ($base !== null) {
                $draft->forceFill(['based_on_id' => $base->id])->save();
                $draft->tags()->sync($base->tags()->pluck('tags.id'));
            }

            return $draft;
        });
    }

    private function base(Article $article): ?ArticleVersion
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
