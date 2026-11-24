<?php

use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\Comment;
use App\Models\CommentLike;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Curtidas em artigos e comentários (RF-148 a RF-158, RF-362 a RF-366, D88).
 */

test('curtir e descurtir um artigo; a contagem é pública e quem curtiu não', function () {
    $article = Article::factory()->published()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('likes.article.store', $article))->assertRedirect();
    $this->actingAs($user)->post(route('likes.article.store', $article));

    expect(ArticleLike::query()->count())->toBe(1);

    $this->actingAs($user)->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('likes.count', 1)
            ->where('likes.liked', true)
            ->where('likes.canLike', true));
    auth()->logout();
    $this->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('likes.count', 1)
            ->where('likes.liked', false)
            ->where('likes.canLike', false));

    $this->actingAs($user)->delete(route('likes.article.destroy', $article));
    expect(ArticleLike::query()->count())->toBe(0);
});

test('o banco impede curtida duplicada (p6-02)', function () {
    $article = Article::factory()->published()->create();
    $user = User::factory()->create();
    ArticleLike::query()->insert(['article_id' => $article->id, 'user_id' => $user->id, 'created_at' => now()]);

    expect(fn () => ArticleLike::query()->insert(['article_id' => $article->id, 'user_id' => $user->id, 'created_at' => now()]))
        ->toThrow(UniqueConstraintViolationException::class);
});

test('ninguém curte o próprio artigo nem o próprio comentário (RF-150, RF-155)', function () {
    $article = Article::factory()->published()->create();
    $comment = Comment::factory()->for($article)->create();

    $this->actingAs($article->author)->post(route('likes.article.store', $article))->assertForbidden();
    $this->actingAs($comment->author)->post(route('likes.comment.store', $comment))->assertForbidden();

    expect(ArticleLike::query()->count())->toBe(0)
        ->and(CommentLike::query()->count())->toBe(0);
});

test('curtir um comentário e ver a contagem na conversa', function () {
    $comment = Comment::factory()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('likes.comment.store', $comment))->assertRedirect();

    $this->actingAs($user)->get(route('articles.show', $comment->article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('comments.items.0.likes.count', 1)
            ->where('comments.items.0.likes.liked', true));
});

test('só conta confirmada curte, e só artigo no ar (RF-148)', function () {
    $article = Article::factory()->published()->create();

    $this->post(route('likes.article.store', $article))->assertRedirect(route('login'));
    $this->actingAs(User::factory()->unverified()->create())
        ->post(route('likes.article.store', $article))
        ->assertRedirect(route('verification.notice'));

    $article->delete();
    $this->actingAs(User::factory()->create())->post(route('likes.article.store', $article->id))->assertNotFound();
});

test('apagar a conta apaga as curtidas dela, e a contagem cai (RF-366)', function () {
    $article = Article::factory()->published()->create();
    $user = User::factory()->create();
    ArticleLike::query()->insert(['article_id' => $article->id, 'user_id' => $user->id, 'created_at' => now()]);

    $user->delete();

    expect($article->likes()->count())->toBe(0);
});

test('Meus artigos mostra as curtidas dos publicados', function () {
    $article = Article::factory()->published()->create();
    ArticleLike::query()->insert(['article_id' => $article->id, 'user_id' => User::factory()->create()->id, 'created_at' => now()]);

    $this->actingAs($article->author)->get(route('articles.mine'))
        ->assertInertia(fn (Assert $page) => $page->where('sections.published.0.likes', 1));
});
