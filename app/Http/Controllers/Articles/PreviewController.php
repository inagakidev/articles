<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Queries\WorkingVersion;
use App\Http\Controllers\Controller;
use App\Http\Resources\Articles\ArticlePage;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Prévia (RF-072, p4-06): a mesma renderização da página pública, então
 * o que se vê aqui é o que vai ao ar. Daqui também se envia (RF-323).
 */
class PreviewController extends Controller
{
    public function __invoke(Request $request, Article $article, WorkingVersion $working, ArticlePage $page): Response
    {
        Gate::authorize('update', $article);

        // "Ver versão enviada" pede uma versão; sem ela, a que o autor tem em mãos.
        $draft = $request->filled('version')
            ? $article->versions()->findOrFail($request->integer('version'))
            : $working->for($article);

        abort_if($draft === null, 404);

        return Inertia::render('articles/preview', [
            'articleId' => $article->id,
            // Só o rascunho é enviado, e só sem outra versão na fila (RF-102)
            'canSubmit' => $draft->status === VersionStatus::Draft
                && ! $article->versions()->where('status', VersionStatus::Pending)->exists(),
            'article' => $page->for($article, $draft),
        ]);
    }
}
