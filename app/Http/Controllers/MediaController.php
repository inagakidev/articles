<?php

namespace App\Http\Controllers;

use App\Models\ArticleImage;
use App\Policies\ArticleImagePolicy;
use App\Support\Media\MediaDelivery;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Entrega as imagens do disco de mídia aplicando a regra de acesso (D53).
 * Fotos de perfil são públicas; imagens de artigo seguem a
 * `ArticleImagePolicy` (RF-090), e quem não pode ver recebe 404.
 */
class MediaController extends Controller
{
    /** O nome do arquivo nunca muda de conteúdo. */
    private const PUBLIC_CACHE = 'public, max-age=31536000, immutable';

    public function __invoke(Request $request, string $path, MediaDelivery $media, ArticleImagePolicy $policy): Response
    {
        if (preg_match('#^avatars/[0-9a-f-]{36}\.webp$#', $path) === 1) {
            return $this->deliver($media, $path, public: true);
        }

        abort_unless(preg_match('#^images/([0-9a-f-]{36})/(original|\d+)\.webp$#', $path, $match) === 1, 404);

        $image = ArticleImage::query()->with('article')->where('uuid', $match[1])->first();

        abort_if($image === null || ! $policy->view($request->user(), $image), 404);

        // Largura ainda não gerada pela fila: vai o original.
        $width = $match[2] === 'original' ? null : (int) $match[2];

        return $this->deliver($media, $image->pathFor($width), public: $policy->isPublic($image));
    }

    private function deliver(MediaDelivery $media, string $path, bool $public): Response
    {
        // No R2, sem perguntar antes se o arquivo existe: seria uma ida a mais
        // ao bucket por imagem, e o próprio R2 responde 404 se não existir.
        if ($media->usesSignedUrls()) {
            return redirect()->away($media->signedUrl($path))
                ->header('Cache-Control', ($public ? 'public' : 'private').', max-age='.$media->redirectMaxAge());
        }

        $disk = $media->disk();

        abort_unless($disk->exists($path), 404);

        // Imagem privada pode virar pública (ou o contrário) na aprovação:
        // só o navegador de quem pode ver guarda, e por pouco tempo.
        return $disk->response($path, headers: ['Cache-Control' => $public ? self::PUBLIC_CACHE : 'private, max-age=300']);
    }
}
