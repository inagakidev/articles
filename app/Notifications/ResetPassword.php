<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * O e-mail de recuperação de senha do Laravel, enviado pela fila. Quem chama
 * informa o idioma da pessoa, porque o worker não conhece a requisição.
 */
class ResetPassword extends BaseResetPassword implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> Segundos de espera antes de cada nova tentativa. */
    public array $backoff = [60, 300];

    public function __construct(string $token)
    {
        parent::__construct($token);

        $this->afterCommit();
    }
}
