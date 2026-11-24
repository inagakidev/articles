<?php

namespace App\Support\Mail\Events;

use Illuminate\Foundation\Events\Dispatchable;

/**
 * A pessoa marcou um e-mail nosso como spam (p6-17, D71). Evento próprio,
 * como o `EmailBounced`.
 */
class EmailComplained
{
    use Dispatchable;

    public function __construct(public readonly string $email) {}
}
