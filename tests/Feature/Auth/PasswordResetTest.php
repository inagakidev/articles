<?php

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Notifications\PasswordChanged;
use App\Notifications\ResetPassword;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::resetPasswords());
});

test('exibe a tela de pedir o link de redefinição', function () {
    $response = $this->get(route('password.request'));

    $response->assertOk();
});

test('pede o link de redefinição de senha', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class);
});

test('exibe a tela de nova senha', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
        $response = $this->get(route('password.reset', $notification->token));

        $response->assertOk();

        return true;
    });
});

test('redefine a senha com token válido', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
        $response = $this->post(route('password.update'), [
            'token' => $notification->token,
            'email' => $user->email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        return true;
    });
});

test('não redefine a senha com token inválido', function () {
    $user = User::factory()->create();

    $response = $this->post(route('password.update'), [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertSessionHasErrors('email');
});

test('a resposta é a mesma para e-mail com conta e sem conta', function () {
    Notification::fake();
    $user = User::factory()->create();

    foreach ([$user->email, 'ninguem@exemplo.dev'] as $email) {
        $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => $email])
            ->assertRedirect(route('password.request'))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('sentTo', $email)
            ->assertSessionHas('resendAfter', 60);
    }
});

test('um segundo pedido cedo demais também não revela nada', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->post(route('password.email'), ['email' => $user->email]);

    $this->from(route('password.request'))
        ->post(route('password.email'), ['email' => $user->email])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('sentTo', $user->email);

    Notification::assertSentToTimes($user, ResetPassword::class, 1);
});

test('a tela mostra o link enviado para o e-mail digitado', function () {
    $this->from(route('password.request'))
        ->post(route('password.email'), ['email' => 'lia@exemplo.dev']);

    $this->get(route('password.request'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/forgot-password')
            ->where('sentTo', 'lia@exemplo.dev')
            ->where('resendAfter', 60));
});

test('a nova senha encerra as outras sessões, vira evento de segurança e gera aviso', function () {
    // Nos testes a sessão fica em memória; em produção ela fica no banco.
    config(['session.driver' => 'database']);
    Notification::fake();
    $user = User::factory()->create(['remember_token' => 'antigo']);
    DB::table('sessions')->insert([
        'id' => 'celular',
        'user_id' => $user->id,
        'payload' => '',
        'last_activity' => now()->timestamp,
    ]);

    $token = Password::broker()->createToken($user);

    $this->post(route('password.update'), [
        'token' => $token,
        'email' => $user->email,
        'password' => 'nova-senha-123',
        'password_confirmation' => 'nova-senha-123',
    ])->assertRedirect(route('login'));

    expect(DB::table('sessions')->where('user_id', $user->id)->exists())->toBeFalse()
        ->and($user->fresh()->remember_token)->not->toBe('antigo')
        ->and(SecurityEvent::where('user_id', $user->id)->sole()->type)
        ->toBe(SecurityEventType::PasswordChanged);

    Notification::assertSentTo($user, PasswordChanged::class);
});

test('os e-mails de senha saem no idioma pedido', function (string $locale, string $reset, string $changed, string $greeting) {
    $user = User::factory()->create();
    app()->setLocale($locale);

    $resetMail = (new ResetPassword('token'))->toMail($user);

    expect($resetMail->subject)->toBe($reset)
        ->and((new PasswordChanged)->toMail($user)->subject)->toBe($changed)
        ->and((string) $resetMail->render())->toContain($greeting)->not->toContain('Regards');
})->with([
    'português' => ['pt_BR', 'Crie uma nova senha', 'Sua senha foi alterada', 'Olá!'],
    'inglês' => ['en', 'Create a new password', 'Your password was changed', 'Hi!'],
]);
