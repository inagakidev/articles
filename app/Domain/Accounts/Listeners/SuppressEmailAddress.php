<?php

namespace App\Domain\Accounts\Listeners;

use App\Models\User;
use App\Support\Mail\Events\EmailBounced;
use App\Support\Mail\Events\EmailComplained;

/**
 * Endereço que voltou ou reclamou deixa de receber e-mails (p6-17, D71),
 * até a pessoa trocar o e-mail da conta. Os avisos dentro do site seguem.
 */
class SuppressEmailAddress
{
    public function handle(EmailBounced|EmailComplained $event): void
    {
        User::query()
            ->where('email', $event->email)
            ->whereNull('email_suppressed_at')
            ->update([
                'email_suppressed_at' => now(),
                'email_suppressed_reason' => $event instanceof EmailBounced ? 'bounce' : 'complaint',
            ]);
    }
}
