<?php

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function failLogin(string $email, int $times = 1): void
{
    foreach (range(1, $times) as $_) {
        test()->from(route('login'))->post(route('login.store'), [
            'email' => $email,
            'password' => 'senha-errada',
        ]);
    }
}

test('depois de 5 senhas erradas o login fica pausado, mesmo com a senha certa', function () {
    $user = User::factory()->create();

    failLogin($user->email, 5);

    $this->from(route('login'))
        ->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('login'))
        ->assertSessionHas('retryAfter', fn (int $seconds) => $seconds > 0 && $seconds <= 60);

    $this->assertGuest();
});

test('a tela de entrar recebe os segundos que faltam para tentar de novo', function () {
    $user = User::factory()->create();

    failLogin($user->email, 6);

    $this->get(route('login'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/login')
            ->where('retryAfter', fn (int $seconds) => $seconds > 0));
});

test('o login volta depois do prazo', function () {
    $user = User::factory()->create();

    failLogin($user->email, 6);
    $this->travel(61)->seconds();

    $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

test('a pausa vira um único evento de segurança da conta', function () {
    $user = User::factory()->create();

    // A 6ª e a 7ª tentativas caem na mesma pausa.
    failLogin($user->email, 7);

    expect(SecurityEvent::all())->toHaveCount(1)
        ->and(SecurityEvent::first())
        ->user_id->toBe($user->id)
        ->type->toBe(SecurityEventType::LoginBlocked)
        ->email->toBe($user->email)
        ->ip_address->toBe('127.0.0.1');
});

test('tentativas contra um e-mail sem conta também são registradas', function () {
    failLogin('Ninguem@Exemplo.dev', 6);

    expect(SecurityEvent::sole())
        ->user_id->toBeNull()
        ->email->toBe('ninguem@exemplo.dev');
});

test('senhas erradas abaixo do limite não viram evento', function () {
    failLogin(User::factory()->create()->email, 5);

    expect(SecurityEvent::count())->toBe(0);
});

test('tentativas suspeitas de login somem depois de 90 dias', function () {
    $event = fn (int $daysAgo) => SecurityEvent::create(['type' => SecurityEventType::LoginBlocked])
        ->forceFill(['created_at' => now()->subDays($daysAgo)])
        ->save();

    $event(91);
    $event(89);

    $this->artisan('model:prune', ['--model' => SecurityEvent::class]);

    expect(SecurityEvent::count())->toBe(1);
});
