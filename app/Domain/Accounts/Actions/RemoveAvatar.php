<?php

namespace App\Domain\Accounts\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

/** Tira a foto de perfil; o perfil volta às iniciais (RF-033). */
class RemoveAvatar
{
    public function handle(User $user): void
    {
        $previous = $user->avatar_path;

        if ($previous === null) {
            return;
        }

        $user->forceFill(['avatar_path' => null])->save();
        Storage::disk(config('filesystems.media'))->delete($previous);
    }
}
