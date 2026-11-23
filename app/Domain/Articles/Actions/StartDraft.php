<?php

namespace App\Domain\Articles\Actions;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Queries\WorkingVersion;
use App\Models\Article;
use App\Models\ArticleVersion;
use Illuminate\Support\Facades\DB;

/**
 * O rascunho que recebe um salvamento (RF-343, RF-329, RF-349). Se ainda
 * não existe, nasce como cópia da versão de trabalho (`WorkingVersion`):
 * a pendente (o autor segue editando enquanto ela espera, RF-103), a em
 * vigor ou a última rejeitada. Só abrir o editor não cria nada (D82).
 */
class StartDraft
{
    public function __construct(private WorkingVersion $working) {}

    public function handle(Article $article): ArticleVersion
    {
        return DB::transaction(function () use ($article) {
            $existing = $article->versions()->where('status', VersionStatus::Draft)->lockForUpdate()->first();

            if ($existing !== null) {
                return $existing;
            }

            $base = $this->working->base($article);
            $draft = $article->versions()->create($base === null ? [] : [
                'title' => $base->title,
                'content' => $base->content,
                'content_text' => $base->content_text,
                'language' => $base->language,
                'category_id' => $base->category_id,
                'cover_image_id' => $base->cover_image_id,
                'cover_alt' => $base->cover_alt,
                'cover_decorative' => $base->cover_decorative,
            ]);

            if ($base !== null) {
                $draft->forceFill(['based_on_id' => $base->id])->save();
                $draft->tags()->sync($base->tags()->pluck('tags.id'));
                // As imagens são as mesmas: a cópia só cita, não duplica arquivos (RF-089)
                $draft->images()->sync($base->images()->pluck('article_images.id'));
            }

            return $draft;
        });
    }
}
