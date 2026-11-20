<?php

use App\Domain\Accounts\Enums\PolicyType;
use App\Domain\Accounts\Queries\CurrentPolicyVersions;
use App\Domain\Accounts\Queries\PolicyDocument;
use App\Http\Middleware\SetLocale;
use Inertia\Testing\AssertableInertia as Assert;

test('as três páginas mostram a versão em vigor, o texto e o histórico', function (string $route, string $type, string $title) {
    // O cliente de testes pede inglês por padrão.
    $this->withHeader('Accept-Language', 'pt-BR')
        ->get(route($route))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('policies/show')
            ->where('type', $type)
            ->where('version.label', '1.0')
            ->where('version.draft', true)
            ->where('document.title', $title)
            ->where('document.readingMinutes', fn (int $minutes) => $minutes > 0)
            ->has('document.summary', 4)
            ->has('history', 1)
            ->where('history.0.changes.0', 'Primeira versão.'));
})->with([
    ['policies.terms', 'terms', 'Termos de uso'],
    ['policies.privacy', 'privacy', 'Política de privacidade'],
    ['policies.content', 'content', 'Política de conteúdo'],
]);

test('o texto sai no idioma da página', function () {
    $this->withCookie(SetLocale::COOKIE, 'en')
        ->get(route('policies.privacy'))
        ->assertInertia(fn (Assert $page) => $page->where('document.title', 'Privacy policy'));
});

test('os contatos vêm da configuração e os links entre políticas viram endereços', function () {
    config(['app.contacts.privacy' => 'dados@exemplo.dev']);

    $privacy = json_encode(app(PolicyDocument::class)->load(app(CurrentPolicyVersions::class)->of(PolicyType::Privacy), 'pt_BR'));
    $terms = json_encode(app(PolicyDocument::class)->load(app(CurrentPolicyVersions::class)->of(PolicyType::Terms), 'pt_BR'));

    expect($privacy)->toContain('dados@exemplo.dev')->not->toContain('{privacy_email}')
        ->and($terms)->toContain('](\/privacy)')->not->toContain('route:');
});

test('o link da moderação destaca um item da Política de conteúdo', function () {
    $this->get(route('policies.content', ['item' => '4.2']))
        ->assertInertia(fn (Assert $page) => $page->where('highlight', '4.2'));

    $this->get(route('policies.terms', ['item' => '4.2']))
        ->assertInertia(fn (Assert $page) => $page->where('highlight', null));
});

test('os itens da Política de conteúdo têm números únicos nos dois idiomas', function (string $locale) {
    $document = app(PolicyDocument::class)->load(app(CurrentPolicyVersions::class)->of(PolicyType::Content), $locale);

    $ids = collect($document['sections'])
        ->flatMap(fn (array $section) => $section['blocks'])
        ->flatMap(fn (array $block) => $block['items'] ?? [])
        ->pluck('id');

    expect($ids)->toHaveCount(10)
        ->and($ids->unique())->toHaveCount(10)
        ->and($ids->every(fn (string $id) => preg_match('/^\d+\.\d+$/', $id)))->toBeTrue();
})->with(['pt_BR', 'en']);
