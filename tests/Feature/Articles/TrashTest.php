<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Lixeira do autor (RF-116 a RF-119, RF-336, RF-340 a RF-342).
 */

test('mandar para a lixeira tira o artigo de Meus artigos e o mostra na Lixeira', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->published()->create();

    $this->actingAs($user)->post(route('articles.trash.store', $article))->assertRedirect();

    expect($article->fresh()->trashed())->toBeTrue()
        ->and($article->fresh()->state)->toBe(ArticleState::Published);

    $this->actingAs($user)->get(route('articles.trash'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('my-articles/trash')
            ->where('articles.0.id', $article->id)
            ->where('articles.0.title', $article->currentVersion->title)
            ->where('trashDays', 7),
        );
});

test('restaurar devolve o artigo ao estado de antes (RF-336)', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->published()->create();
    $article->delete();

    $this->actingAs($user)->delete(route('articles.trash.destroy', $article))->assertRedirect();

    expect($article->fresh()->trashed())->toBeFalse()
        ->and($article->fresh()->state)->toBe(ArticleState::Published);
});

test('depois de sete dias não dá para restaurar', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->create();
    $article->delete();
    $this->travel(7)->days();
    $this->travel(1)->minutes();

    $this->actingAs($user)->delete(route('articles.trash.destroy', $article))->assertForbidden();
});

test('só quem escreveu manda para a lixeira e restaura', function () {
    $article = Article::factory()->create();
    $other = User::factory()->create();

    $this->actingAs($other)->post(route('articles.trash.store', $article))->assertForbidden();

    $article->delete();
    $this->actingAs($other)->delete(route('articles.trash.destroy', $article))->assertForbidden();
});

test('na lixeira há mais de sete dias, sai de vez com os arquivos (RF-119)', function () {
    Storage::fake('media');
    $old = Article::factory()->create();
    $image = ArticleImage::factory()->for($old)->create();
    Storage::disk('media')->put($image->path(), 'original');
    $old->delete();
    $recent = Article::factory()->create();

    $this->travel(8)->days();
    $recent->delete();

    $this->artisan('model:prune', ['--model' => [Article::class]])->assertSuccessful();

    expect(Article::withTrashed()->find($old->id))->toBeNull()
        ->and(Storage::disk('media')->exists($image->path()))->toBeFalse()
        ->and(Article::withTrashed()->find($recent->id))->not->toBeNull();
});
