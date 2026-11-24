<?php

namespace App\Domain\Audit\Exceptions;

use LogicException;

/** O registro de auditoria só aceita inclusões (RF-291). */
class AuditLogIsAppendOnly extends LogicException
{
    public static function make(): self
    {
        return new self('O registro de auditoria só aceita inclusões.');
    }
}
