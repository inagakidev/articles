<?php

use App\Domain\Accounts\Enums\SecurityEventType;
use App\Models\SecurityEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/*
 * Comandos de instalação (RF-244) e de recuperação do 2FA (RF-018).
 */

test('cria a administradora com e-mail confirmado e políticas aceitas', function () {
    $this->artisan('admin:create', ['email' => 'Amanda@Exemplo.dev'])
        ->expectsQuestion('Nome', 'Amanda Inagaki')
        ->expectsQuestion('Username', 'Amanda')
        ->expectsQuestion('Senha', 'senha-forte-123')
        ->expectsQuestion('Confirme a senha', 'senha-forte-123')
        ->expectsOutputToContain('@amanda é a administradora')
        ->assertExitCode(0);

    $admin = User::query()->where('email', 'amanda@exemplo.dev')->sole();

    expect($admin->is_admin)->toBeTrue()
        ->and($admin->username)->toBe('amanda')
        ->and($admin->email_verified_at)->not->toBeNull()
        ->and($admin->policyAcceptances()->count())->toBe(2)
        ->and($admin->hasConfirmedTwoFactor())->toBeFalse();
});

test('recusa dados inválidos sem criar nada', function () {
    User::factory()->create(['username' => 'amanda']);

    $this->artisan('admin:create', ['email' => 'amanda@exemplo.dev'])
        ->expectsQuestion('Nome', 'Amanda')
        ->expectsQuestion('Username', 'amanda')
        ->expectsQuestion('Senha', 'curta')
        ->expectsQuestion('Confirme a senha', 'curta')
        ->assertFailed();

    expect(User::query()->where('is_admin', true)->exists())->toBeFalse();
});

test('promove uma conta existente depois de confirmar', function () {
    $user = User::factory()->create(['email' => 'amanda@exemplo.dev']);

    $this->artisan('admin:create', ['email' => 'amanda@exemplo.dev'])
        ->expectsConfirmation("Já existe a conta @{$user->username} com esse e-mail. Torná-la administradora?", 'yes')
        ->assertSuccessful();

    expect($user->fresh()->is_admin)->toBeTrue();
});

test('não promove conta sem e-mail confirmado', function () {
    $user = User::factory()->unverified()->create(['email' => 'amanda@exemplo.dev']);

    $this->artisan('admin:create', ['email' => 'amanda@exemplo.dev'])
        ->expectsConfirmation("Já existe a conta @{$user->username} com esse e-mail. Torná-la administradora?", 'yes')
        ->expectsOutputToContain('ainda não confirmou o e-mail')
        ->assertFailed();

    expect($user->fresh()->is_admin)->toBeFalse();
});

test('o MVP tem uma só administradora', function () {
    User::factory()->admin()->create(['email' => 'primeira@exemplo.dev']);
    $user = User::factory()->create(['email' => 'segunda@exemplo.dev']);

    $this->artisan('admin:create', ['email' => 'segunda@exemplo.dev'])
        ->expectsConfirmation("Já existe a conta @{$user->username} com esse e-mail. Torná-la administradora?", 'yes')
        ->expectsOutputToContain('Já existe uma administradora: primeira@exemplo.dev')
        ->assertFailed();

    expect($user->fresh()->is_admin)->toBeFalse();
});

test('zera o 2FA da administradora, encerra as sessões e registra o evento', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create();
    DB::table('sessions')->insert([
        'id' => 'sessao-da-admin', 'user_id' => $admin->id, 'payload' => '', 'last_activity' => time(),
    ]);
    config(['session.driver' => 'database']);

    $this->artisan('admin:reset-2fa')
        ->expectsConfirmation("Apagar o 2FA de @{$admin->username} ({$admin->email}) e encerrar as sessões dela?", 'yes')
        ->assertSuccessful();

    $admin->refresh();

    expect($admin->two_factor_secret)->toBeNull()
        ->and($admin->two_factor_recovery_codes)->toBeNull()
        ->and($admin->two_factor_confirmed_at)->toBeNull()
        ->and(DB::table('sessions')->where('user_id', $admin->id)->exists())->toBeFalse()
        ->and(SecurityEvent::query()->where('user_id', $admin->id)->where('type', SecurityEventType::TwoFactorReset)->exists())->toBeTrue();

    // No próximo acesso, o painel pede a ativação de novo.
    $this->actingAs($admin)->get(route('admin.dashboard'))->assertRedirect(route('admin.two-factor.show'));
});

test('sem confirmação, o 2FA fica como estava', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create();

    $this->artisan('admin:reset-2fa')
        ->expectsConfirmation("Apagar o 2FA de @{$admin->username} ({$admin->email}) e encerrar as sessões dela?", 'no')
        ->assertFailed();

    expect($admin->fresh()->hasConfirmedTwoFactor())->toBeTrue();
});

test('sem administradora, o reset avisa como criar', function () {
    $this->artisan('admin:reset-2fa')
        ->expectsOutputToContain('php artisan admin:create')
        ->assertFailed();
});
