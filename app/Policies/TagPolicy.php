<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;

/**
 * A administradora bloqueia, une e exclui tags (RF-129, RF-251). Criar é
 * livre para os autores, pelo editor (RF-127).
 */
class TagPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_admin;
    }

    public function update(User $user, Tag $tag): bool
    {
        return $user->is_admin;
    }

    public function delete(User $user, Tag $tag): bool
    {
        return $user->is_admin;
    }
}
