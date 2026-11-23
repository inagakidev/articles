<?php

namespace App\Domain\Articles\Exceptions;

use DomainException;

/** Envio para revisão recusado (RF-318, RF-344), com o motivo de cada campo. */
class SubmissionRefused extends DomainException
{
    /** @param  list<string>  $missing */
    public function __construct(public readonly array $missing)
    {
        parent::__construct('Envio recusado: '.implode(', ', $missing));
    }
}
