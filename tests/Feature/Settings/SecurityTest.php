<?php

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use App\Notifications\PasswordChanged;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('quem não administra não vê o 2FA, que fica para depois do MVP (RF-019)', function () {
    $this->actingAs(User::factory()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManageTwoFactor', false)
            ->missing('twoFactorEnabled')
            ->missing('recoveryCodes'),
        );
});

test('a administradora vê o 2FA ativo, sem códigos até gerar novos', function () {
    $this->actingAs(User::factory()->admin()->withTwoFactor()->create())
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('canManageTwoFactor', true)
            ->where('twoFactorEnabled', true)
            ->where('recoveryCodes', []),
        );
});

test('a administradora gera novos códigos de recuperação e os vê uma vez', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create();
    $this->actingAs($admin)->withSession(['auth.password_confirmed_at' => time()]);

    $this->from(route('security.edit'))
        ->post(route('two-factor.regenerate-recovery-codes'))
        ->assertRedirect(route('security.edit'));

    $codes = $admin->fresh()->recoveryCodes();

    expect($codes)->toHaveCount(8)->not->toContain('recovery-code-1');

    $this->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page->where('recoveryCodes', $codes));

    $this->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page->where('recoveryCodes', []));
});

test('quem não administra não consegue ativar o 2FA', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->post(route('two-factor.enable'))
        ->assertForbidden();

    expect($user->fresh()->two_factor_secret)->toBeNull();
});

test('a administradora não consegue desligar o 2FA (RF-017)', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create();

    $this->actingAs($admin)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->delete(route('two-factor.disable'))
        ->assertForbidden();

    expect($admin->fresh()->hasConfirmedTwoFactor())->toBeTrue();
});

test('a página de segurança exige confirmar a senha quando ativado', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    $user = User::factory()->create();

    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]);

    $response = $this->actingAs($user)
        ->get(route('security.edit'));

    $response->assertRedirect(route('password.confirm'));
});

test('exibe a página de segurança sem 2FA quando o recurso está desligado', function () {
    $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

    config(['fortify.features' => []]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->where('canManageTwoFactor', false)
            ->missing('twoFactorEnabled'),
        );
});

test('mostra o e-mail, a troca pendente e quando a senha mudou', function () {
    $user = User::factory()->create([
        'email' => 'lia@exemplo.dev',
        'pending_email' => 'nova@exemplo.dev',
        'pending_email_expires_at' => now()->addHours(5),
    ]);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('email', 'lia@exemplo.dev')
            ->where('pendingEmail.address', 'nova@exemplo.dev')
            ->where('passwordChangedAt', null),
        );
});

test('troca vencida não aparece como pendente', function () {
    $user = User::factory()->create([
        'pending_email' => 'nova@exemplo.dev',
        'pending_email_expires_at' => now()->subMinute(),
    ]);

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertInertia(fn (Assert $page) => $page->where('pendingEmail', null));
});

test('troca a senha', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('trocar a senha logada avisa por e-mail, registra e derruba só as outras sessões (RF-031)', function () {
    Notification::fake();
    config(['session.driver' => 'database']);
    $user = User::factory()->create();
    DB::table('sessions')->insert([
        'id' => 'outro-aparelho', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time(),
    ]);

    $this->actingAs($user)
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ])
        ->assertSessionHasNoErrors();

    Notification::assertSentTo($user, PasswordChanged::class);
    expect(DB::table('sessions')->where('id', 'outro-aparelho')->exists())->toBeFalse()
        ->and(SecurityEvent::query()->where('user_id', $user->id)->where('type', SecurityEventType::PasswordChanged)->exists())->toBeTrue();

    $this->get(route('profile.edit'))->assertOk();
});

test('exige a senha atual correta para trocar a senha', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect(route('security.edit'));
});
