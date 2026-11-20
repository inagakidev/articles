<?php

namespace App\Console\Commands;

use App\Notifications\MailCheck;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Validator;
use Throwable;

/**
 * Envia na hora um e-mail com a configuração atual, para conferir o provedor
 * antes de virar a chave (D71).
 */
#[Signature('mail:test {email : Endereço que recebe o e-mail de teste}')]
#[Description('Envia um e-mail de teste com o mailer configurado, sem passar pela fila')]
class SendTestMail extends Command
{
    public function handle(): int
    {
        $email = (string) $this->argument('email');

        if (Validator::make(['email' => $email], ['email' => 'required|email'])->fails()) {
            $this->error("Endereço inválido: {$email}");

            return self::FAILURE;
        }

        $mailer = (string) config('mail.default');

        try {
            Notification::route('mail', $email)->notifyNow(new MailCheck($mailer));
        } catch (Throwable $exception) {
            $this->error("O mailer \"{$mailer}\" não enviou: {$exception->getMessage()}");

            return self::FAILURE;
        }

        $this->info("E-mail de teste enviado para {$email} pelo mailer \"{$mailer}\".");

        return self::SUCCESS;
    }
}
