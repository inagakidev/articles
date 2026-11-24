<?php

namespace App\Domain\Moderation\Exceptions;

use RuntimeException;

/**
 * A decisão não vale mais: a autora retirou a versão da fila, ou outra
 * decisão chegou antes (RF-105, R03). A mensagem é a chave de tradução.
 */
class DecisionRefused extends RuntimeException
{
    public static function notPending(): self
    {
        return new self('moderation.refused.not_pending');
    }

    public static function notPublished(): self
    {
        return new self('moderation.refused.not_published');
    }
}
