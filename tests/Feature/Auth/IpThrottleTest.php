<?php

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

test('o login pausa depois de 20 envios do mesmo IP, mesmo com e-mails diferentes', function () {
    foreach (range(1, 20) as $i) {
        $this->post(route('login.store'), ['email' => "pessoa{$i}@exemplo.dev", 'password' => 'x']);
    }

    $user = User::factory()->create();

    $this->from(route('login'))
        ->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('login'))
        ->assertSessionHas('retryAfter', fn (int $seconds) => $seconds > 0);

    $this->assertGuest();
    expect(SecurityEvent::where('type', SecurityEventType::LoginBlocked)->where('email', $user->email)->exists())
        ->toBeTrue();
});

test('o limite de login de um IP não afeta outro IP', function () {
    foreach (range(1, 21) as $i) {
        $this->post(route('login.store'), ['email' => "pessoa{$i}@exemplo.dev", 'password' => 'x']);
    }

    $user = User::factory()->create();

    $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
        ->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

    $this->assertAuthenticatedAs($user);
});

test('pedidos de link param depois de 10 por hora do mesmo IP', function () {
    Notification::fake();
    $users = User::factory()->count(11)->create();

    foreach ($users->take(10) as $user) {
        $this->post(route('password.email'), ['email' => $user->email]);
    }

    $this->from(route('password.request'))
        ->post(route('password.email'), ['email' => $users->last()->email])
        ->assertSessionHasErrors('email')
        ->assertSessionMissing('sentTo');

    Notification::assertSentTimes(ResetPassword::class, 10);
    Notification::assertNotSentTo($users->last(), ResetPassword::class);
});
