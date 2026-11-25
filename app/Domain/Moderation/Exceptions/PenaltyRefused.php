<?php

namespace App\Domain\Moderation\Exceptions;

use RuntimeException;

class PenaltyRefused extends RuntimeException
{
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
