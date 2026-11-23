<?php

namespace App\Domain\Articles\Exceptions;

use DomainException;

/** Retirada com um rascunho mais novo: o autor precisa escolher qual manter (RF-104). */
class WithdrawalNeedsChoice extends DomainException
{
    public function __construct()
    {
        parent::__construct('Escolha qual versão manter.');
    }
}
