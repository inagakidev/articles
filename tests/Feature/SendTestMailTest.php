<?php

use App\Notifications\MailCheck;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;

test('envia o e-mail de teste na hora, pelo mailer configurado', function () {
    Notification::fake();

    $this->artisan('mail:test', ['email' => 'lia@exemplo.dev'])
        ->expectsOutputToContain('pelo mailer "array"')
        ->assertSuccessful();

    Notification::assertSentOnDemand(
        MailCheck::class,
        fn (MailCheck $notification, array $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === 'lia@exemplo.dev',
    );
});

test('recusa um endereço inválido', function () {
    Notification::fake();

    $this->artisan('mail:test', ['email' => 'não-é-email'])->assertFailed();

    Notification::assertNothingSent();
});

test('mostra o erro quando o provedor não aceita o envio', function () {
    // Nada escuta na porta 1: o transporte SMTP falha na conexão.
    config([
        'mail.default' => 'smtp',
        'mail.mailers.smtp.host' => '127.0.0.1',
        'mail.mailers.smtp.port' => 1,
    ]);

    $this->artisan('mail:test', ['email' => 'lia@exemplo.dev'])
        ->expectsOutputToContain('O mailer "smtp" não enviou')
        ->assertFailed();
});
