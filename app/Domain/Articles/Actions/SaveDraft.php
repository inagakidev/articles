<?php

namespace App\Domain\Articles\Actions;

use App\Domain\Articles\Exceptions\InvalidStateTransition;
use App\Domain\Taxonomy\Actions\ResolveTags;
use App\Models\ArticleImage;
use App\Models\ArticleVersion;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use Illuminate\Support\Facades\DB;

/**
 * Salva o rascunho, à mão ou pelo salvamento automático (RF-071, RF-073).
 * Só o rascunho aceita mudanças; o conteúdo é limpo antes de gravar e o
 * texto puro é extraído para busca e contagens (D51). Não cria versão
 * (RF-322).
 */
class SaveDraft
{
    public function __construct(
        private DocumentSanitizer $sanitizer,
        private ArticleRenderer $renderer,
        private ResolveTags $resolveTags,
    ) {}

    /**
     * @param  array{title?: string|null, content?: mixed, language?: string|null, category_id?: int|null, tags?: list<string>, cover_image?: string|null, cover_alt?: string|null, cover_decorative?: bool}  $data  já validados
     */
    public function handle(ArticleVersion $draft, array $data): void
    {
        if (! $draft->status->isEditable()) {
            throw InvalidStateTransition::between($draft->status, $draft->status);
        }

        $tags = array_key_exists('tags', $data) ? $this->resolveTags->handle($data['tags']) : null;

        DB::transaction(function () use ($draft, $data, $tags) {
            if (array_key_exists('content', $data)) {
                $content = $this->sanitizer->sanitize($data['content']);
                $draft->content = $content;
                $draft->content_text = $this->renderer->text($content);
            }

            if (array_key_exists('cover_image', $data)) {
                $draft->cover_image_id = $data['cover_image'] === null
                    ? null
                    : ArticleImage::query()->where('article_id', $draft->article_id)->where('uuid', $data['cover_image'])->value('id');
            }

            $draft->fill(collect($data)->only(['title', 'language', 'category_id', 'cover_alt', 'cover_decorative'])->all());
            $draft->save();
            $draft->article()->first()?->touch();

            if ($tags !== null) {
                $draft->tags()->sync($tags->pluck('id'));
            }

            if (array_key_exists('content', $data) || array_key_exists('cover_image', $data)) {
                $this->syncImages($draft);
            }
        });
    }

    /**
     * Liga a versão às imagens que ela cita, no texto e na capa: é o que
     * decide quem pode vê-las (RF-090) e o que a limpeza preserva (p4-11).
     */
    private function syncImages(ArticleVersion $draft): void
    {
        $uuids = DocumentSanitizer::imageIds($draft->content ?? DocumentSanitizer::empty());
        $ids = ArticleImage::query()
            ->where('article_id', $draft->article_id)
            ->whereIn('uuid', $uuids)
            ->pluck('id')
            ->when($draft->cover_image_id !== null, fn ($ids) => $ids->push($draft->cover_image_id))
            ->unique();

        $draft->images()->sync($ids);
    }
}
