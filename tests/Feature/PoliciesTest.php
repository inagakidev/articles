<?php

use App\Http\Middleware\SetLocale;
use Inertia\Testing\AssertableInertia as Assert;

test('as páginas mostram a versão em vigor de cada documento', function (string $route, string $type) {
    $this->get(route($route))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('policies/show')
            ->where('type', $type)
            ->where('version', '2026-11-draft')
            ->where('draft', true)
            ->where('html', fn (string $html) => str_contains($html, '<h2>')));
})->with([
    ['policies.terms', 'terms'],
    ['policies.privacy', 'privacy'],
]);

test('o texto sai no idioma da página', function () {
    $this->withCookie(SetLocale::COOKIE, 'en')
        ->get(route('policies.privacy'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('html', fn (string $html) => str_contains($html, 'What we keep')));
});
