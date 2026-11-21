<?php

namespace App\Domain\Accounts\Actions;

use App\Models\User;
use App\Support\Images\ImageProcessor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

/**
 * Troca a foto de perfil (RF-026, RF-032): a imagem é regravada sem
 * metadados (D52) e guardada no disco de mídia (D53). A foto antiga é
 * apagada só depois que a nova está salva.
 */
class UpdateAvatar
{
    public function __construct(private ImageProcessor $images) {}

    public function handle(User $user, UploadedFile $file): void
    {
        $disk = Storage::disk(config('filesystems.media'));
        $path = 'avatars/'.Str::uuid().'.webp';
        $previous = $user->avatar_path;

        $disk->put($path, $this->images->avatar($file));

        try {
            $user->forceFill(['avatar_path' => $path])->save();
        } catch (Throwable $exception) {
            $disk->delete($path);

            throw $exception;
        }

        if ($previous !== null) {
            $disk->delete($previous);
        }
    }
}
