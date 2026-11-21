<?php

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Notifications\ConfirmNewEmail;
use App\Notifications\EmailChangeRequested;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

/*
 * Troca de e-mail de conta confirmada (RF-030, p3-06): o novo confirma pelo
 * link em 24 h, o atual é avisado, e a conta segue verificada no meio-tempo.
 */

beforeEach(function () {
    Notification::fake();
});

function confirmationLink(User $user): string
{
    return URL::temporarySignedRoute('settings.email.confirm', now()->addHours(24), [
        'user' => $user->id,
        'hash' => sha1((string) $user->pending_email),
    ]);
}

test('pedir a troca avisa os dois endereços e mantém o e-mail atual, confirmado', function () {
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);

    $this->actingAs($user)
        ->post(route('settings.email.store'), ['email' => 'Lia.Nova@Exemplo.dev'])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    $user->refresh();

    expect($user->email)->toBe('lia@exemplo.dev')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->pending_email)->toBe('lia.nova@exemplo.dev')
        ->and($user->pending_email_expires_at->diffInHours(now(), true))->toBeGreaterThan(23.9);

    Notification::assertSentTo(
        new AnonymousNotifiable,
        ConfirmNewEmail::class,
        fn ($notification, $channels, $notifiable) => $notifiable->routes['mail'] === 'lia.nova@exemplo.dev',
    );
    Notification::assertSentTo($user, EmailChangeRequested::class);
});

test('recusa o mesmo e-mail, um já usado ou incompleto', function (string $email) {
    User::factory()->create(['email' => 'ocupado@exemplo.dev']);
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);

    $this->actingAs($user)
        ->post(route('settings.email.store'), ['email' => $email])
        ->assertSessionHasErrors('email');

    expect($user->fresh()->pending_email)->toBeNull();
})->with(['lia@exemplo.dev', 'ocupado@exemplo.dev', 'lia@exemplo']);

test('o link confirma o e-mail novo e registra a troca', function () {
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);
    $this->actingAs($user)->post(route('settings.email.store'), ['email' => 'nova@exemplo.dev']);
    $user->refresh();

    $this->get(confirmationLink($user))->assertRedirect(route('security.edit'));

    $user->refresh();

    expect($user->email)->toBe('nova@exemplo.dev')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->pending_email)->toBeNull();

    $event = SecurityEvent::query()->where('user_id', $user->id)->sole();

    expect($event->type)->toBe(SecurityEventType::EmailChanged)
        ->and($event->email)->toBe('lia@exemplo.dev');
});

test('o link funciona em outro aparelho, sem login, e leva ao login', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('settings.email.store'), ['email' => 'nova@exemplo.dev']);
    auth()->logout();

    $this->get(confirmationLink($user->fresh()))->assertRedirect(route('login'));

    expect($user->fresh()->email)->toBe('nova@exemplo.dev');
});

test('depois de 24 horas a troca cai', function () {
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);
    $this->actingAs($user)->post(route('settings.email.store'), ['email' => 'nova@exemplo.dev']);
    $link = confirmationLink($user->fresh());

    $this->travel(25)->hours();

    $this->get($link)->assertForbidden();

    expect($user->fresh()->email)->toBe('lia@exemplo.dev');
});

test('cancelar a troca invalida o link já enviado', function () {
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);
    $this->actingAs($user)->post(route('settings.email.store'), ['email' => 'nova@exemplo.dev']);
    $link = confirmationLink($user->fresh());

    $this->actingAs($user)->delete(route('settings.email.destroy'))->assertRedirect(route('security.edit'));
    $this->get($link);

    expect($user->fresh())->email->toBe('lia@exemplo.dev')->pending_email->toBeNull();
});

test('um pedido novo invalida o link do anterior', function () {
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);
    $this->actingAs($user)->post(route('settings.email.store'), ['email' => 'primeira@exemplo.dev']);
    $old = confirmationLink($user->fresh());
    $this->actingAs($user)->post(route('settings.email.store'), ['email' => 'segunda@exemplo.dev']);

    $this->get($old);

    expect($user->fresh())->email->toBe('lia@exemplo.dev')->pending_email->toBe('segunda@exemplo.dev');
});

test('se outra conta passou a usar o e-mail, a troca não acontece', function () {
    $user = User::factory()->create(['email' => 'lia@exemplo.dev']);
    $this->actingAs($user)->post(route('settings.email.store'), ['email' => 'nova@exemplo.dev']);
    User::factory()->create(['email' => 'nova@exemplo.dev']);

    $this->get(confirmationLink($user->fresh()));

    expect($user->fresh()->email)->toBe('lia@exemplo.dev');
});

test('conta sem confirmar troca o e-mail pela tela de confirmação, não por aqui', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('settings.email.store'), ['email' => 'nova@exemplo.dev'])
        ->assertRedirect(route('verification.notice'));
});
