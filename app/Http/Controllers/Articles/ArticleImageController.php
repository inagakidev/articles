<?php

namespace App\Http\Controllers\Articles;

use App\Domain\Articles\Actions\StoreArticleImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Articles\ArticleImageRequest;
use App\Models\Article;
use App\Support\Media\ArticleImageSources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;

/**
 * Envio de imagem pelo editor, em JSON (RF-082). A imagem só passa a
 * contar quando o rascunho a citar, no texto ou na capa.
 */
class ArticleImageController extends Controller
{
    public function store(ArticleImageRequest $request, Article $article, StoreArticleImage $store, ArticleImageSources $sources): JsonResponse
    {
        Gate::authorize('update', $article);

        /** @var UploadedFile $file */
        $file = $request->file('image');
        $image = $store->handle($article, $request->user(), $file);
        $source = $sources->source($image);

        return response()->json([
            'id' => $image->uuid,
            'src' => $source->src,
            'width' => $image->width,
            'height' => $image->height,
        ], 201);
    }
}
