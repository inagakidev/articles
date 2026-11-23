<?php

namespace App\Domain\Articles\Actions;

use App\Jobs\GenerateImageVariants;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\User;
use App\Support\Images\ImageProcessor;
use App\Support\Media\MediaDelivery;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Throwable;

/**
 * Recebe uma imagem para o artigo (RF-082, RF-086, D52): regrava o
 * original sem metadados e deixa os tamanhos menores para a fila. A imagem
 * ainda não está em versão nenhuma; ela entra quando o rascunho a citar.
 */
class StoreArticleImage
{
    public function __construct(
        private ImageProcessor $images,
        private MediaDelivery $media,
    ) {}

    public function handle(Article $article, User $user, UploadedFile $file): ArticleImage
    {
        $processed = $this->images->articleOriginal($file);
        $image = new ArticleImage;
        $image->uuid = (string) Str::uuid();
        $image->width = $processed->width;
        $image->height = $processed->height;
        $image->size = strlen($processed->contents);
        $image->article()->associate($article);
        $image->user_id = $user->id;

        $disk = $this->media->disk();
        $disk->put($image->path(), $processed->contents);

        try {
            $image->save();
        } catch (Throwable $exception) {
            $disk->delete($image->path());

            throw $exception;
        }

        GenerateImageVariants::dispatch($image);

        return $image;
    }
}
