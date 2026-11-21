<?php

namespace App\Support\Media;

use Carbon\CarbonImmutable;
use Illuminate\Filesystem\AwsS3V3Adapter;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

/**
 * Como uma imagem do disco de mídia chega ao navegador (D53). No R2, por
 * uma URL pré-assinada; no disco local, pelo próprio arquivo.
 *
 * A URL é assinada com o começo da hora como data da assinatura e vale por
 * duas horas a partir dele: dentro da mesma hora, todo pedido recebe a
 * mesma URL, e o navegador reaproveita o cache em vez de baixar de novo.
 */
class MediaDelivery
{
    /** Uma URL nova a cada hora; cada uma vale por duas, então sobra pelo menos uma. */
    private const WINDOW_MINUTES = 60;

    public function disk(): FilesystemAdapter
    {
        /** @var FilesystemAdapter */
        return Storage::disk(config('filesystems.media'));
    }

    /** Se as imagens saem por URL assinada (R2) em vez do arquivo. */
    public function usesSignedUrls(): bool
    {
        return $this->disk() instanceof AwsS3V3Adapter;
    }

    /** URL pré-assinada estável dentro da janela atual. */
    public function signedUrl(string $path): string
    {
        /** @var AwsS3V3Adapter $disk */
        $disk = $this->disk();
        $client = $disk->getClient();
        $start = $this->windowStart();

        $command = $client->getCommand('GetObject', [
            'Bucket' => $disk->getConfig()['bucket'],
            'Key' => $path,
        ]);

        return (string) $client->createPresignedRequest(
            $command,
            $start->addMinutes(self::WINDOW_MINUTES * 2),
            ['start_time' => $start->getTimestamp()],
        )->getUri();
    }

    /** Segundos que o navegador pode guardar o redirecionamento: até a próxima janela. */
    public function redirectMaxAge(): int
    {
        return (int) now()->diffInSeconds($this->windowStart()->addMinutes(self::WINDOW_MINUTES));
    }

    private function windowStart(): CarbonImmutable
    {
        return now()->startOfHour();
    }
}
