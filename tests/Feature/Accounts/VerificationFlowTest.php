<?php

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('a tela de confirmação mostra o e-mail e a espera para reenviar', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->withSession(['resendAfter' => 60])
        ->get(route('verification.notice'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/verify-email')
            ->where('email', $user->email)
            ->where('resendAfter', 60));
});

test('"Usar outro e-mail" troca o e-mail, registra o evento e manda um novo link', function () {
    Notification::fake();
    $user = User::factory()->unverified()->create(['email' => 'errado@exemplo.dev']);

    $this->actingAs($user)
        ->put(route('verification.email.update'), ['email' => 'certo@exemplo.dev'])
        ->assertRedirect(route('verification.notice'))
        ->assertSessionHas('resendAfter', 60);

    expect($user->fresh()->email)->toBe('certo@exemplo.dev')
        ->and(SecurityEvent::where('user_id', $user->id)->sole()->type)->toBe(SecurityEventType::EmailChanged);
    Notification::assertSentTo($user, VerifyEmail::class);
});

test('o novo e-mail precisa estar livre', function () {
    User::factory()->create(['email' => 'ocupado@exemplo.dev']);
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->put(route('verification.email.update'), ['email' => 'ocupado@exemplo.dev'])
        ->assertSessionHasErrors('email');
});

test('conta já confirmada não troca o e-mail por aqui', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('verification.email.update'), ['email' => 'novo@exemplo.dev'])
        ->assertForbidden();
});

test('a tela de e-mail confirmado só abre para quem confirmou', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('verification.confirmed'))
        ->assertInertia(fn (Assert $page) => $page->component('auth/email-confirmed'));

    $this->actingAs(User::factory()->unverified()->create())
        ->get(route('verification.confirmed'))
        ->assertRedirect(route('verification.notice'));
});

test('contas não confirmadas são excluídas no 8º dia e liberam username e e-mail', function () {
    $old = User::factory()->unverified()->create(['username' => 'antiga', 'created_at' => now()->subDays(8)]);
    $recent = User::factory()->unverified()->create(['created_at' => now()->subDays(6)]);
    $verified = User::factory()->create(['created_at' => now()->subDays(30)]);

    $this->artisan('model:prune', ['--model' => User::class]);

    expect(User::find($old->id))->toBeNull()
        ->and(User::find($recent->id))->not->toBeNull()
        ->and(User::find($verified->id))->not->toBeNull();

    User::factory()->create(['username' => 'antiga', 'email' => $old->email]);
});

test('trocar o idioma com a conta aberta vale também para os e-mails', function () {
    $user = User::factory()->create(['locale' => 'pt_BR']);

    $this->actingAs($user)->put(route('locale.update'), ['locale' => 'en']);

    expect($user->fresh()->locale)->toBe('en')
        ->and($user->fresh()->preferredLocale())->toBe('en');
});

test('"Usar outro e-mail" também exige o domínio completo', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->put(route('verification.email.update'), ['email' => 'lia@gmail'])
        ->assertSessionHasErrors('email');
});
