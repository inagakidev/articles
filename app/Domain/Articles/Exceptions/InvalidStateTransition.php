<?php

namespace App\Domain\Articles\Exceptions;

use DomainException;
use UnitEnum;

/** Uma mudança de estado que o modelo de dois estados não permite (§5). */
class InvalidStateTransition extends DomainException
{
    public static function between(UnitEnum $from, UnitEnum $to): self
    {
        return new self(sprintf('Transição não permitida: %s → %s.', $from->name, $to->name));
    }
}
