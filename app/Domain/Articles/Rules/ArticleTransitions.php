<?php

namespace App\Domain\Articles\Rules;

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Exceptions\InvalidStateTransition;

/**
 * Transições do artigo (RF-338, RF-339). Ir para a lixeira e voltar dela
 * (RF-340, RF-341) não muda este estado: a lixeira o preserva (D79).
 */
final class ArticleTransitions
{
    public static function allows(ArticleState $from, ArticleState $to): bool
    {
        return match ($from) {
            // RF-338: primeira aprovação de uma versão
            ArticleState::Unpublished => $to === ArticleState::Published,
            // RF-339: despublicação pela administradora
            ArticleState::Published => $to === ArticleState::Unpublished,
        };
    }

    /** @throws InvalidStateTransition */
    public static function ensure(ArticleState $from, ArticleState $to): void
    {
        if (! self::allows($from, $to)) {
            throw InvalidStateTransition::between($from, $to);
        }
    }
}
