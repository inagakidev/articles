<?php

namespace App\Http\Requests\Articles;

use App\Models\Article;
use App\Models\ArticleImage;
use App\Support\Editor\ArticleRenderer;
use App\Support\Editor\DocumentSanitizer;
use App\Support\Editor\EditorSchema;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * O rascunho pode ser salvo vazio (RF-318); só os limites valem: título com
 * até 150 caracteres e conteúdo com até 50.000 (RF-078). Os campos que não
 * vêm ficam como estão.
 */
class DraftRequest extends FormRequest
{
    /** Tags por artigo: o bastante para descrever, pouco para virar spam (D80). */
    public const MAX_TAGS = 10;

    /** Só o título é aparado: no documento, os espaços fazem parte do texto. */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('title'))) {
            $this->merge(['title' => trim($this->input('title'))]);
        }
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'nullable', 'string', 'max:150'],
            'content' => ['sometimes', 'nullable', 'array', $this->contentLimit(), $this->contentImages()],
            'language' => ['sometimes', 'nullable', Rule::in(config('app.locales'))],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'tags' => ['sometimes', 'array', 'max:'.self::MAX_TAGS],
            'tags.*' => ['string', 'max:60'],
            // A capa é uma imagem já enviada para este artigo (RF-079)
            'cover_image' => ['sometimes', 'nullable', 'string', Rule::in($this->articleImageIds())],
            'cover_alt' => ['sometimes', 'nullable', 'string', 'max:'.EditorSchema::IMAGE_TEXT_MAX],
            'cover_decorative' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'title' => __('editor.title'),
            'content' => __('editor.content'),
            'category_id' => __('editor.details.category'),
            'tags' => __('editor.details.tags'),
            'cover_image' => __('editor.cover.label'),
            'cover_alt' => __('editor.image.alt'),
        ];
    }

    /**
     * Imagens do texto: até cinco (RF-080), todas deste artigo.
     */
    private function contentImages(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            $ids = DocumentSanitizer::imageIds(app(DocumentSanitizer::class)->sanitize($value));

            if (count($ids) > EditorSchema::MAX_IMAGES) {
                $fail(__('editor.image.too_many', ['max' => EditorSchema::MAX_IMAGES]));
            } elseif (array_diff($ids, $this->articleImageIds()) !== []) {
                $fail(__('editor.image.unknown'));
            }
        };
    }

    /** @return list<string> */
    private function articleImageIds(): array
    {
        $article = $this->route('article');

        if (! $article instanceof Article) {
            return [];
        }

        return array_values($article->images()->get(['uuid'])->map(fn (ArticleImage $image) => $image->uuid)->all());
    }

    private function contentLimit(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            $text = app(ArticleRenderer::class)->text(app(DocumentSanitizer::class)->sanitize($value));

            if (mb_strlen($text) > EditorSchema::MAX_CHARACTERS) {
                $fail(__('editor.content_too_long', ['max' => number_format(EditorSchema::MAX_CHARACTERS, 0, ',', '.')]));
            }
        };
    }
}
