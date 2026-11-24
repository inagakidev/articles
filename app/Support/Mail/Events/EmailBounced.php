<?php

namespace App\Support\Mail\Events;

use Illuminate\Foundation\Events\Dispatchable;

/**
 * O provedor avisou que o e-mail não chegou de vez (p6-17, D71). Evento
 * próprio, sem nada do provedor: o adaptador do webhook, que entra junto
 * com o provedor (P8-12), só traduz o aviso para cá.
 */
class EmailBounced
{
    use Dispatchable;

    public function __construct(public readonly string $email) {}
}
