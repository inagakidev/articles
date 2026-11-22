<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Actions\SaveDraft;
use App\Domain\Articles\Actions\StartDraft;
use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Http\Controllers\Controller;
use App\Http\Requests\Articles\DraftRequest;
use App\Models\Article;
use App\Models\ArticleVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Salvamento do rascunho em JSON, chamado pelo salvamento automático do
 * editor (RF-071) sem recarregar a página.
 */
class DraftController extends Controller
{
    /** Primeiro salvamento de um artigo novo: cria o artigo e o rascunho. */
    public function store(DraftRequest $request, StartDraft $start, SaveDraft $save): JsonResponse
    {
        Gate::authorize('create', Article::class);

        $article = DB::transaction(function () use ($request, $start, $save) {
            $article = Article::query()->create(['user_id' => $request->user()->id]);
            // O editor de um artigo novo já mostra o idioma da interface (prancha
            // "Editor vazio"); ele vale mesmo que a pessoa não mexa no campo.
            $this->save($save, $start->handle($article), [
                'language' => app()->getLocale(),
                ...$request->validated(),
            ]);

            return $article;
        });

        return response()->json([
            'articleId' => $article->id,
            'editUrl' => route('articles.edit', $article, absolute: false),
            'savedAt' => now()->toIso8601String(),
        ], 201);
    }

    public function update(DraftRequest $request, Article $article, StartDraft $start, SaveDraft $save): JsonResponse
    {
        Gate::authorize('update', $article);

        $this->save($save, $start->handle($article), $request->validated());

        return response()->json(['savedAt' => now()->toIso8601String()]);
    }

    /** @param  array<string, mixed>  $data */
    private function save(SaveDraft $save, ArticleVersion $draft, array $data): void
    {
        try {
            $save->handle($draft, $data);
        } catch (TaxonomyRefused $exception) {
            throw ValidationException::withMessages([
                'tags' => __('editor.details.tag_blocked', ['tag' => Str::after($exception->getMessage(), 'tag_blocked:')]),
            ]);
        }
    }
}
