<?php

namespace App\Http\Requests\Articles;

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
            'content' => ['sometimes', 'nullable', 'array', $this->contentLimit()],
            'language' => ['sometimes', 'nullable', Rule::in(config('app.locales'))],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'tags' => ['sometimes', 'array', 'max:'.self::MAX_TAGS],
            'tags.*' => ['string', 'max:60'],
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
        ];
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
