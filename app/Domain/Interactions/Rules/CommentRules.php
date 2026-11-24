<?php

namespace App\Domain\Interactions\Rules;

/** Limites dos comentários (RF-138, RF-139). */
final class CommentRules
{
    public const MAX_LENGTH = 2000;

    /** Comentário, resposta e resposta da resposta. */
    public const MAX_DEPTH = 3;

    /** Um comentário a cada 30 segundos por pessoa. */
    public const COOLDOWN_SECONDS = 30;
}
