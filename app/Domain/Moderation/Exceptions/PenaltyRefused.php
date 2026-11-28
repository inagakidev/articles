<?php

namespace App\Domain\Moderation\Exceptions;

use RuntimeException;

class PenaltyRefused extends RuntimeException
{
    /** Ninguém penaliza a si mesma nem outra administradora. */
    public static function notPenalizable(): self
    {
        return new self('moderation.penalties.not_penalizable');
    }

    /** Reabrir o prazo só vale para banimento retido, sem contestação e com o prazo vencido (RF-234). */
    public static function notReopenable(): self
    {
        return new self('moderation.appeals.not_reopenable');
    }

    public static function active(): self
    {
        return new self('moderation.penalties.already_active');
    }

    public static function appealClosed(): self
    {
        return new self('moderation.appeals.closed');
    }

    public static function deadlineExpired(): self
    {
        return new self('moderation.appeals.expired');
    }

    public static function alreadyAppealed(): self
    {
        return new self('moderation.appeals.already');
    }
}
