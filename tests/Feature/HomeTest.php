<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a página de apresentação é pública', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('home'));
});

test('sem conteúdo publicado, as seções que dependem dele vêm vazias', function () {
    $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->where('categories', [])
        ->where('recentArticles', [])
        ->where('authors', ['count' => 0, 'people' => []])
    );
});

test('quem tem conta também vê a página de apresentação', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('home'));
});
