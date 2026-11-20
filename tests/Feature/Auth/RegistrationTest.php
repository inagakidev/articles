<?php

use App\Http\Middleware\SetLocale;
use App\Models\User;
use App\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('exibe a tela de criar conta', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

function registration(array $overrides = []): array
{
    return [
        'name' => 'Lia Martins',
        'username' => 'lia-martins',
        'email' => 'lia@exemplo.dev',
        'password' => 'password',
        'password_confirmation' => 'password',
        'age_confirmed' => '1',
        'policies_accepted' => '1',
        ...$overrides,
    ];
}

test('novos usuários se cadastram e vão confirmar o e-mail', function () {
    Notification::fake();

    $this->post(route('register.store'), registration())
        ->assertRedirect(route('verification.notice'))
        ->assertSessionHas('resendAfter', 60);

    $this->assertAuthenticated();
    $user = User::sole();
    expect($user->username)->toBe('lia-martins')
        ->and($user->hasVerifiedEmail())->toBeFalse();
    Notification::assertSentTo($user, VerifyEmail::class);
});

test('o cadastro registra a data e a versão aceita dos Termos e da Privacidade', function () {
    $this->post(route('register.store'), registration());

    $accepted = User::sole()->policyAcceptances()->with('policyVersion')->get();

    expect($accepted->map(fn ($acceptance) => $acceptance->policyVersion->type->value)->sort()->values()->all())
        ->toBe(['privacy', 'terms'])
        ->and($accepted->every(fn ($acceptance) => $acceptance->accepted_at !== null))->toBeTrue();
});

test('sem as declarações o cadastro é recusado', function (string $field) {
    $this->post(route('register.store'), registration([$field => null]))
        ->assertSessionHasErrors($field);

    $this->assertGuest();
    expect(User::count())->toBe(0);
})->with(['age_confirmed', 'policies_accepted']);

test('o username é guardado em minúsculas e não se repete por maiúsculas', function () {
    User::factory()->create(['username' => 'lia-martins']);

    $this->post(route('register.store'), registration(['username' => 'Lia-Martins']))
        ->assertSessionHasErrors('username');

    $this->post(route('register.store'), registration(['username' => '  LIA_M  ', 'email' => 'outra@exemplo.dev']));

    expect(User::where('email', 'outra@exemplo.dev')->value('username'))->toBe('lia_m');
});

test('a conta guarda o idioma em que foi criada', function () {
    $this->withCookie(SetLocale::COOKIE, 'en')->post(route('register.store'), registration());

    expect(User::sole()->locale)->toBe('en');
});

test('a senha precisa de 8 caracteres', function () {
    $this->post(route('register.store'), registration(['password' => '1234567', 'password_confirmation' => '1234567']))
        ->assertSessionHasErrors('password');
});

test('recusa e-mail sem o domínio completo', function (string $email) {
    $this->post(route('register.store'), registration(['email' => $email]))
        ->assertSessionHasErrors(['email' => __('validation.custom.email.email')]);

    expect(User::count())->toBe(0);
})->with(['gabislis233@gmail', 'lia@localhost', 'lia@']);

test('aceita e-mail com domínio completo', function (string $email) {
    $this->post(route('register.store'), registration(['email' => $email]))
        ->assertSessionHasNoErrors();
})->with(['gabislis233@gmail.com', 'lia@sub.dominio.com.br']);
