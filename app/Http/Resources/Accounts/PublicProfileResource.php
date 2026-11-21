<?php

namespace App\Http\Resources\Accounts;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Só o que o perfil público mostra (RF-025): nunca e-mail ou dados da conta.
 *
 * @mixin User
 */
class PublicProfileResource extends JsonResource
{
    public static $wrap = null;

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'username' => $this->username,
            'bio' => $this->bio,
            'avatar' => $this->avatar,
            'memberSince' => $this->created_at?->toDateString(),
        ];
    }
}
