<?php

use App\Models\User;

/*
 * Cada tela pública passa pelo axe nos dois temas, nos dois idiomas e no
 * celular. Falha com qualquer violação "critical" ou "serious" (D63).
 *
 * Antes de analisar, espera a animação de entrada terminar (até ~1,1 s): no
 * meio dela o texto ainda está transparente e o axe mediria um contraste falso.
 */
const ENTRANCE_SECONDS = 1.5;

$telas = [
    'início' => '/',
    'entrar' => '/login',
    'criar conta' => '/register',
    'recuperar senha' => '/forgot-password',
    'nova senha' => '/reset-password/token?email=lia%40exemplo.dev',
    'termos de uso' => '/terms',
    'política de privacidade' => '/privacy',
    'política de conteúdo com item destacado' => '/content-policy?item=4.2',
];

it('não tem problemas de acessibilidade no tema claro', function (string $url) {
    visit($url)->inLightMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade no tema escuro', function (string $url) {
    visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade em inglês', function (string $url) {
    visit($url)->withLocale('en-US')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade no celular', function (string $url) {
    visit($url)->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with($telas);

it('não tem problemas de acessibilidade nas telas de confirmação de e-mail', function (bool $verified, string $url) {
    $user = User::factory()->state(['email_verified_at' => $verified ? now() : null])->create();
    $this->actingAs($user);

    visit($url)->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
})->with([
    'confira seu e-mail' => [false, '/email/verify'],
    'e-mail confirmado' => [true, '/email/confirmed'],
]);

it('não tem problemas de acessibilidade no novo aceite das políticas', function () {
    $this->actingAs(User::factory()->withoutAcceptedPolicies()->create());

    visit('/policies/accept')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/policies/accept')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no painel da administração', function () {
    $this->actingAs(User::factory()->admin()->withTwoFactor()->create());

    visit('/admin')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/admin')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/admin')->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade na confirmação de senha e na ativação do 2FA', function () {
    $this->actingAs(User::factory()->admin()->create());

    visit('/admin')
        ->withLocale('pt-BR')
        ->wait(ENTRANCE_SECONDS)
        ->assertNoAccessibilityIssues()
        ->type('password', 'password')
        ->press('Confirmar')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Proteja o painel')
        ->assertNoAccessibilityIssues()
        ->press('Ativar agora')
        ->wait(ENTRANCE_SECONDS)
        ->assertSee('Escaneie o QR code')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no código do 2FA ao entrar', function () {
    $admin = User::factory()->admin()->withTwoFactor()->create();

    visit('/login')
        ->withLocale('pt-BR')
        ->type('email', $admin->email)
        ->type('password', 'password')
        ->click('button[type="submit"]')
        ->wait(3)
        ->assertSee('Verificação em duas etapas')
        ->assertNoAccessibilityIssues()
        ->press('Usar um código de recuperação')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade nas configurações', function () {
    $this->actingAs(User::factory()->create([
        'bio' => 'Front-end com foco em acessibilidade.',
        'pending_email' => 'nova@exemplo.dev',
        'pending_email_expires_at' => now()->addHours(10),
    ]));

    foreach (['/settings/profile', '/settings/appearance'] as $url) {
        visit($url)->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
        visit($url)->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    }

    visit('/settings/security')
        ->withLocale('pt-BR')
        ->type('password', 'password')
        ->click('button[type="submit"]')
        ->wait(3)
        ->assertSee('Troca de e-mail pendente')
        ->assertNoAccessibilityIssues()
        ->press('Alterar senha')
        ->assertNoAccessibilityIssues();
});

it('não tem problemas de acessibilidade no perfil público', function () {
    User::factory()->create(['username' => 'rafa-moreira', 'bio' => 'Dev back-end.']);

    visit('/@rafa-moreira')->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/@rafa-moreira')->inDarkMode()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
    visit('/@rafa-moreira')->on()->mobile()->wait(ENTRANCE_SECONDS)->assertNoAccessibilityIssues();
});
