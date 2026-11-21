<?php

namespace App\Domain\Accounts\Exceptions;

use DomainException;

/** O link da troca de e-mail não vale mais. A mensagem é a chave de tradução. */
class EmailChangeFailed extends DomainException
{
    public static function expired(): self
    {
        return new self('settings.email.link_expired');
    }

    public static function taken(): self
    {
        return new self('settings.email.link_taken');
    }
}
