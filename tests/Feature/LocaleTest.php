<?php

use App\Http\Middleware\SetLocale;
use Inertia\Testing\AssertableInertia as Assert;

test('o português é o padrão', function () {
    // O cliente de testes envia "en-us" por padrão; aqui, navegador sem idioma
    $this->withHeader('Accept-Language', '')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
});

test('usa o idioma do navegador quando nada foi escolhido', function () {
    $this->withHeader('Accept-Language', 'en-US,en;q=0.9')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
});

test('idioma do navegador não suportado cai para o português', function () {
    $this->withHeader('Accept-Language', 'de-DE,de;q=0.9')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
});

test('o idioma escolhido vence o do navegador', function () {
    $this->withHeader('Accept-Language', 'en-US')
        ->withCookie(SetLocale::COOKIE, 'pt_BR')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
});

test('ignora valor desconhecido no cookie', function () {
    $this->withHeader('Accept-Language', '')
        ->withCookie(SetLocale::COOKIE, 'xx')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
});

test('troca o idioma', function () {
    $this->from(route('home'))
        ->put(route('locale.update'), ['locale' => 'en'])
        ->assertRedirect(route('home'))
        ->assertCookie(SetLocale::COOKIE, 'en');
});

test('só aceita idiomas suportados', function () {
    $this->from(route('home'))
        ->put(route('locale.update'), ['locale' => 'fr'])
        ->assertSessionHasErrors('locale')
        ->assertCookieMissing(SetLocale::COOKIE);
});

test('o html lang acompanha o idioma', function () {
    $this->withCookie(SetLocale::COOKIE, 'en')
        ->get(route('home'))
        ->assertSee('<html lang="en"', false);

    $this->withCookie(SetLocale::COOKIE, 'pt_BR')
        ->get(route('home'))
        ->assertSee('<html lang="pt-BR"', false);
});
