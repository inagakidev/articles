<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Models\Article;
use App\Models\Favorite;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Favoritos (RF-159 a RF-162, RF-367 a RF-369, D89).
 */

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('favoritar e tirar; a contagem é pública e a lista, não', function () {
    $article = Article::factory()->published()->create();

    $this->actingAs($this->user)->post(route('favorites.store', $article))->assertRedirect();
    $this->actingAs($this->user)->post(route('favorites.store', $article));

    expect(Favorite::query()->count())->toBe(1);

    $this->actingAs($this->user)->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('favorites.count', 1)
            ->where('favorites.favorited', true)
            ->where('favorites.canFavorite', true));

    auth()->logout();
    $this->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('favorites.count', 1)
            ->where('favorites.favorited', false)
            ->where('favorites.canFavorite', false));

    $this->actingAs($this->user)->delete(route('favorites.destroy', $article))->assertRedirect();
    expect(Favorite::query()->count())->toBe(0);
});

test('o banco impede favorito duplicado (p6-03)', function () {
    $article = Article::factory()->published()->create();
    Favorite::query()->create(['article_id' => $article->id, 'user_id' => $this->user->id]);

    expect(fn () => Favorite::query()->create(['article_id' => $article->id, 'user_id' => $this->user->id]))
        ->toThrow(UniqueConstraintViolationException::class);
});

test('a autora pode favoritar o próprio artigo (RF-150)', function () {
    $article = Article::factory()->for($this->user, 'author')->published()->create();

    $this->actingAs($this->user)->post(route('favorites.store', $article))->assertRedirect();

    expect(Favorite::query()->count())->toBe(1);
});

test('só conta confirmada favorita, e só artigo no ar (RF-159)', function () {
    $article = Article::factory()->published()->create();

    $this->actingAs(User::factory()->unverified()->create())
        ->post(route('favorites.store', $article))
        ->assertRedirect(route('verification.notice'));

    auth()->logout();
    $this->post(route('favorites.store', $article))->assertRedirect(route('login'));

    $draft = Article::factory()->create();
    $this->actingAs($this->user)->post(route('favorites.store', $draft))->assertForbidden();

    expect(Favorite::query()->count())->toBe(0);
});

test('a lista é só de quem salvou, nas duas ordens (RF-160)', function () {
    $old = tap(Article::factory()->published()->create(), fn (Article $a) => $a->forceFill(['first_published_at' => now()->subMonth()])->save());
    $new = tap(Article::factory()->published()->create(), fn (Article $a) => $a->forceFill(['first_published_at' => now()->subDay()])->save());
    Favorite::query()->create(['article_id' => $new->id, 'user_id' => $this->user->id, 'created_at' => now()->subHour()]);
    Favorite::query()->create(['article_id' => $old->id, 'user_id' => $this->user->id, 'created_at' => now()]);
    Favorite::query()->create(['article_id' => $old->id, 'user_id' => User::factory()->create()->id]);

    $this->actingAs($this->user)->get(route('favorites.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('favorites/index')
            ->where('sort', 'salvos')
            ->where('favorites.total', 2)
            ->where('favorites.data.0.articleId', $old->id)
            ->where('favorites.data.0.article.url', route('articles.show', $old->slug, absolute: false)));

    $this->actingAs($this->user)->get(route('favorites.index', ['ordem' => 'publicados']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('sort', 'publicados')
            ->where('favorites.data.0.articleId', $new->id));

    // Ordem desconhecida volta para o padrão
    $this->actingAs($this->user)->get(route('favorites.index', ['ordem' => 'x']))
        ->assertInertia(fn (Assert $page) => $page->where('sort', 'salvos'));

    auth()->logout();
    $this->get(route('favorites.index'))->assertRedirect(route('login'));
});

test('artigo fora do ar fica na lista como indisponível, até sair dela', function () {
    $unpublished = Article::factory()->published()->create();
    $trashed = Article::factory()->published()->create();
    foreach ([$unpublished, $trashed] as $article) {
        Favorite::query()->create(['article_id' => $article->id, 'user_id' => $this->user->id]);
    }
    $unpublished->forceFill(['state' => ArticleState::Unpublished])->save();
    $trashed->delete();

    $this->actingAs($this->user)->get(route('favorites.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('favorites.total', 2)
            ->where('favorites.data.0.article', null)
            ->where('favorites.data.1.article', null));

    // Não volta para a lista enquanto estiver fora do ar, mas sai dela
    $this->actingAs($this->user)->delete(route('favorites.destroy', $trashed))->assertRedirect();
    $this->actingAs($this->user)->delete(route('favorites.destroy', $unpublished))->assertRedirect();
    $this->actingAs($this->user)->post(route('favorites.store', $unpublished))->assertForbidden();

    expect(Favorite::query()->count())->toBe(0);
});

test('desfazer devolve o artigo ao mesmo lugar da lista', function () {
    $article = Article::factory()->published()->create();
    $savedAt = now()->subDays(3)->startOfSecond();

    $this->actingAs($this->user)->post(route('favorites.store', $article), ['saved_at' => $savedAt->toIso8601String()]);

    expect(Favorite::query()->sole()->created_at->equalTo($savedAt))->toBeTrue();

    // Data no futuro não vale: fica a de agora
    $other = Article::factory()->published()->create();
    $this->actingAs($this->user)->post(route('favorites.store', $other), ['saved_at' => now()->addYear()->toIso8601String()]);

    expect(Favorite::query()->where('article_id', $other->id)->sole()->created_at->isFuture())->toBeFalse();
});

test('excluir o artigo ou a conta tira os favoritos (RF-369, RF-372)', function () {
    $article = Article::factory()->published()->create();
    $other = User::factory()->create();
    Favorite::query()->create(['article_id' => $article->id, 'user_id' => $this->user->id]);
    Favorite::query()->create(['article_id' => $article->id, 'user_id' => $other->id]);

    $other->delete();
    expect(Favorite::query()->count())->toBe(1);

    $article->forceDelete();
    expect(Favorite::query()->count())->toBe(0);
});
