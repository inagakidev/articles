<?php

use App\Domain\Accounts\Enums\PolicyType;
use App\Models\PolicyVersion;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function publishNewTerms(): PolicyVersion
{
    // Uma versão 2.0 dos Termos, com o mesmo texto da 1.0 para o teste.
    copy(resource_path('policies/terms/1.0.pt_BR.json'), resource_path('policies/terms/2.0.pt_BR.json'));

    return PolicyVersion::forceCreate([
        'type' => PolicyType::Terms,
        'version' => '2.0',
        'draft' => false,
        'published_at' => now(),
    ]);
}

afterEach(function () {
    @unlink(resource_path('policies/terms/2.0.pt_BR.json'));
});

test('quem não aceitou a versão em vigor é levado ao novo aceite', function () {
    $user = User::factory()->withoutAcceptedPolicies()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('policies.acceptance.show'));
});

test('ler as políticas e sair continuam livres antes do aceite', function () {
    $user = User::factory()->withoutAcceptedPolicies()->create();

    $this->actingAs($user)->get(route('policies.terms'))->assertOk();
    $this->actingAs($user)->post(route('logout'))->assertRedirect(route('home'));
});

test('aceitar registra as versões em vigor e volta para onde a pessoa ia', function () {
    $user = User::factory()->withoutAcceptedPolicies()->create();

    $this->actingAs($user)->get(route('dashboard'));
    $this->actingAs($user)
        ->post(route('policies.acceptance.store'), ['accepted' => '1'])
        ->assertRedirect(route('dashboard'));

    expect($user->policyAcceptances()->count())->toBe(2);
    $this->actingAs($user)->get(route('dashboard'))->assertOk();
});

test('sem marcar a caixa o aceite é recusado', function () {
    $user = User::factory()->withoutAcceptedPolicies()->create();

    $this->actingAs($user)
        ->post(route('policies.acceptance.store'))
        ->assertSessionHasErrors('accepted');

    expect($user->policyAcceptances()->count())->toBe(0);
});

test('uma versão nova dos Termos pede novo aceite e mostra o que mudou', function () {
    $user = User::factory()->create();
    publishNewTerms();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('policies.acceptance.show'));

    $this->actingAs($user)
        ->get(route('policies.acceptance.show'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/accept-policies')
            ->has('documents', 1)
            ->where('documents.0.type', 'terms')
            ->where('documents.0.version', '2.0')
            ->where('documents.0.previous.version', '1.0')
            ->has('documents.0.changes'));
});

test('sem nada para aceitar, a tela de aceite leva ao início', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('policies.acceptance.show'))
        ->assertRedirect(route('home'));
});
