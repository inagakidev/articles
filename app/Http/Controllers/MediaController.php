<?php

namespace App\Http\Controllers;

use App\Support\Media\MediaDelivery;
use Symfony\Component\HttpFoundation\Response;

/**
 * Entrega as imagens do disco de mídia aplicando a regra de acesso (D53).
 * Por enquanto só existem fotos de perfil, que são públicas; as imagens
 * dos artigos entram com a fatia de imagens.
 */
class MediaController extends Controller
{
    public function __invoke(string $path, MediaDelivery $media): Response
    {
        abort_unless(preg_match('#^avatars/[0-9a-f-]{36}\.webp$#', $path) === 1, 404);

        // No R2, sem perguntar antes se o arquivo existe: seria uma ida a mais
        // ao bucket por imagem, e o próprio R2 responde 404 se não existir.
        if ($media->usesSignedUrls()) {
            return redirect()->away($media->signedUrl($path))
                ->header('Cache-Control', 'public, max-age='.$media->redirectMaxAge());
        }

        $disk = $media->disk();

        abort_unless($disk->exists($path), 404);

        // O nome do arquivo muda a cada troca de foto, então o conteúdo nunca muda.
        return $disk->response($path, headers: ['Cache-Control' => 'public, max-age=31536000, immutable']);
    }
}
