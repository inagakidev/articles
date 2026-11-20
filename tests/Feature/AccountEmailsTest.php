<?php

use App\Http\Middleware\SetLocale;
use App\Models\User;
use App\Notifications\ResetPassword;
use App\Notifications\VerifyEmail;
use Illuminate\Notifications\SendQueuedNotifications;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Laravel\Fortify\Features;

test('a verificação de e-mail vai para a fila em vez de sair na hora', function () {
    Queue::fake();

    User::factory()->unverified()->create()->sendEmailVerificationNotification();

    Queue::assertPushed(
        SendQueuedNotifications::class,
        fn (SendQueuedNotifications $job) => $job->notification instanceof VerifyEmail,
    );
});

test('a recuperação de senha vai para a fila em vez de sair na hora', function () {
    Queue::fake();

    User::factory()->create()->sendPasswordResetNotification('token');

    Queue::assertPushed(
        SendQueuedNotifications::class,
        fn (SendQueuedNotifications $job) => $job->notification instanceof ResetPassword,
    );
});

test('o e-mail sai no idioma em que a pessoa usa o site', function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
    Notification::fake();

    $user = User::factory()->create();

    $this->withCookie(SetLocale::COOKIE, 'en')
        ->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo(
        $user,
        ResetPassword::class,
        fn (ResetPassword $notification) => $notification->locale === 'en',
    );
});

test('o e-mail é entregue quando a fila processa o job', function () {
    // Nos testes a fila é síncrona e o mailer guarda as mensagens em memória.
    $user = User::factory()->unverified()->create();

    $user->sendEmailVerificationNotification();

    $messages = app('mailer')->getSymfonyTransport()->messages();

    expect($messages)->toHaveCount(1)
        ->and($messages->first()->getEnvelope()->getRecipients()[0]->getAddress())
        ->toBe($user->email);
});
