<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Queries\PublicArticles;
use App\Models\Article;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Perfil público em /@username (RF-025, D77): só o que é público.
 */

test('mostra nome, username, bio, foto e desde quando a pessoa está na comunidade', function () {
    $user = User::factory()->create([
        'name' => 'Rafa Moreira',
        'username' => 'rafa-moreira',
        'bio' => 'Dev back-end.',
        'email' => 'rafa@exemplo.dev',
    ]);

    $this->get('/@rafa-moreira')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('profile/show')
            ->where('profile', [
                'name' => 'Rafa Moreira',
                'username' => 'rafa-moreira',
                'bio' => 'Dev back-end.',
                'avatar' => null,
                'memberSince' => $user->created_at->toDateString(),
            ])
            ->where('articles.data', [])
            ->where('articles.total', 0)
            ->where('order', 'recentes'),
        );
});

test('nunca envia o e-mail nem dados da conta', function () {
    User::factory()->create(['username' => 'rafa', 'email' => 'rafa@exemplo.dev']);

    $this->get('/@rafa')->assertDontSee('rafa@exemplo.dev');
});

test('conta sem e-mail confirmado ou inexistente não tem perfil', function () {
    User::factory()->unverified()->create(['username' => 'nova']);

    $this->get('/@nova')->assertNotFound();
    $this->get('/@ninguem')->assertNotFound();
});

test('lista só os artigos visíveis da pessoa (p5-06)', function () {
    $user = User::factory()->create(['username' => 'rafa']);
    $old = Article::factory()->for($user, 'author')->published()->create();
    $old->forceFill(['first_published_at' => now()->subDays(3)])->save();
    $new = Article::factory()->for($user, 'author')->published()->create();
    Article::factory()->for($user, 'author')->create();
    Article::factory()->for($user, 'author')->published()->create()->delete();
    Article::factory()->for($user, 'author')->published()->create()->forceFill(['state' => ArticleState::Unpublished])->save();
    Article::factory()->published()->create();

    $this->get('/@rafa')
        ->assertInertia(fn (Assert $page) => $page
            ->where('articles.total', 2)
            ->where('articles.data.0.url', '/artigos/'.$new->slug)
            ->where('articles.data.1.url', '/artigos/'.$old->slug),
        );

    $this->get('/@rafa?ordem=antigos')
        ->assertInertia(fn (Assert $page) => $page
            ->where('order', 'antigos')
            ->where('articles.data.0.url', '/artigos/'.$old->slug),
        );
});

test('os artigos do perfil vêm por página', function () {
    $user = User::factory()->create(['username' => 'rafa']);
    Article::factory()->for($user, 'author')->published()->count(PublicArticles::PER_AUTHOR_PAGE + 1)->create();

    $this->get('/@rafa?page=2')
        ->assertInertia(fn (Assert $page) => $page
            ->has('articles.data', 1)
            ->where('articles.currentPage', 2)
            ->where('articles.total', PublicArticles::PER_AUTHOR_PAGE + 1),
        );
});
