<?php

namespace App\Domain\Interactions\Exceptions;

use RuntimeException;

/**
 * Uma interação que a regra recusa. A mensagem é a chave de tradução, e
 * `seconds` diz quanto falta para comentar de novo.
 */
class InteractionRefused extends RuntimeException
{
    public function __construct(string $key, public readonly int $seconds = 0)
    {
        parent::__construct($key);
    }

    /** O artigo não está à vista do público (RF-352). */
    public static function notVisible(): self
    {
        return new self('interactions.refused.not_visible');
    }

    /** Ninguém curte o próprio conteúdo (RF-150, RF-155). */
    public static function ownContent(): self
    {
        return new self('interactions.refused.own_content');
    }

    /** Respostas vão até 3 níveis (RF-138). */
    public static function tooDeep(): self
    {
        return new self('interactions.refused.too_deep');
    }

    /** Um comentário a cada 30 segundos (RF-139). */
    public static function tooSoon(int $seconds): self
    {
        return new self('interactions.refused.too_soon', $seconds);
    }
}
