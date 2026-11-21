<?php

namespace App\Domain\Accounts\Exceptions;

use App\Models\User;
use DomainException;

/**
 * Recusa ao tornar alguém administradora: o MVP tem uma só (RF-244) e o
 * painel exige o e-mail confirmado.
 */
class CannotMakeAdministrator extends DomainException
{
    public static function alreadyExists(User $administrator): self
    {
        return new self("Já existe uma administradora: {$administrator->email}. O MVP tem uma só (RF-244).");
    }

    public static function unverified(User $user): self
    {
        return new self("A conta {$user->email} ainda não confirmou o e-mail. Confirme antes de torná-la administradora.");
    }
}
