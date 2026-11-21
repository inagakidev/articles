<?php

namespace App\Http\Controllers;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Entrega as imagens do disco de mídia (D53) aplicando a regra de acesso.
 * Por enquanto só existem fotos de perfil, que são públicas; as imagens
 * dos artigos entram com a fatia de imagens. No R2, redireciona para uma
 * URL pré-assinada; no disco local, envia o arquivo.
 */
class MediaController extends Controller
{
    /** Validade da URL pré-assinada, arredondada para o navegador reaproveitar o cache. */
    private const WINDOW_MINUTES = 60;

    public function __invoke(string $path): Response
    {
        abort_unless(preg_match('#^avatars/[0-9a-f-]{36}\.webp$#', $path) === 1, 404);

        $name = config('filesystems.media');
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk($name);

        abort_unless($disk->exists($path), 404);

        // O nome do arquivo muda a cada troca de foto, então o conteúdo nunca muda.
        $cache = 'public, max-age=31536000, immutable';

        if (config("filesystems.disks.{$name}.driver") === 's3') {
            $expires = now()->startOfHour()->addMinutes(self::WINDOW_MINUTES * 2);

            return redirect()->away($disk->temporaryUrl($path, $expires))
                ->header('Cache-Control', 'public, max-age='.(self::WINDOW_MINUTES * 60));
        }

        return $disk->response($path, headers: ['Cache-Control' => $cache]);
    }
}
