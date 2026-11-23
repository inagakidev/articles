<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Articles\Queries\WorkingVersion;
use App\Http\Controllers\Controller;
use App\Http\Requests\Articles\ArticleImageRequest;
use App\Http\Requests\Articles\DraftRequest;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Support\Editor\EditorSchema;
use App\Support\Media\ArticleImageSources;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * O editor (prancha "Editor"). Um artigo novo só é criado no primeiro
 * salvamento, para "Escrever" não deixar rascunhos vazios para trás.
 */
class EditorController extends Controller
{
    public function __construct(private ArticleImageSources $sources) {}

    public function create(Request $request): Response
    {
        Gate::authorize('create', Article::class);

        return $this->render(null, null, $request);
    }

    /** Abrir não cria rascunho: ele nasce no primeiro salvamento (D82). */
    public function edit(Request $request, Article $article, WorkingVersion $working): Response
    {
        Gate::authorize('update', $article);

        return $this->render($article, $working->for($article), $request);
    }

    private function render(?Article $article, ?ArticleVersion $draft, Request $request): Response
    {
        return Inertia::render('articles/edit', [
            'articleId' => $article?->id,
            'published' => $article?->current_version_id !== null,
            // Com outra versão na fila, o envio desta espera a retirada (RF-102)
            'hasPending' => $article !== null && $article->versions()->where('status', VersionStatus::Pending)->exists(),
            'draft' => [
                'title' => $draft->title ?? '',
                'content' => $draft?->content,
                // Artigo novo já vem no idioma da interface (prancha "Editor vazio")
                'language' => $draft === null ? app()->getLocale() : $draft->language,
                'categoryId' => $draft?->category_id,
                'tags' => $draft?->tags()->orderBy('name')->pluck('name') ?? [],
                'cover' => $draft?->coverImage === null ? null : [
                    'id' => $draft->coverImage->uuid,
                    'src' => $this->sources->source($draft->coverImage)->src,
                    'alt' => $draft->cover_alt,
                    'decorative' => $draft->cover_decorative,
                ],
                // "Salvo às" só vale para o rascunho; a versão enviada não é salva aqui
                'updatedAt' => $draft?->status === VersionStatus::Draft ? $draft->updated_at?->toIso8601String() : null,
                'createdAt' => $draft?->status === VersionStatus::Draft ? $draft->created_at?->toIso8601String() : null,
            ],
            'categories' => Category::query()->orderBy('id')->get()
                ->map(fn (Category $category) => [
                    'id' => $category->id,
                    'name' => $category->name(),
                    'color' => $category->color->value,
                ]),
            'limits' => [
                'title' => 150,
                'characters' => EditorSchema::MAX_CHARACTERS,
                'tags' => DraftRequest::MAX_TAGS,
                'images' => EditorSchema::MAX_IMAGES,
                'imageText' => EditorSchema::IMAGE_TEXT_MAX,
                'imageMegabytes' => ArticleImageRequest::MAX_KILOBYTES / 1024,
                'wordsPerMinute' => EditorSchema::WORDS_PER_MINUTE,
            ],
            // Endereço de cada imagem já enviada, para o editor mostrar as do texto
            'images' => $article === null ? (object) [] : $article->images()->get()
                ->mapWithKeys(fn (ArticleImage $image) => [$image->uuid => $this->sources->source($image)->src]),
            'colors' => EditorSchema::COLORS,
            'codeLanguages' => EditorSchema::CODE_LANGUAGES,
        ]);
    }
}
