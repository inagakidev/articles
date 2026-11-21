<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;

/*
 * O modelo de dois estados no banco (p4-01, D79): os limites de RF-351
 * valem mesmo com pedidos ao mesmo tempo, e a lixeira guarda o estado.
 */

function versionOf(Article $article, VersionStatus $status): ArticleVersion
{
    return ArticleVersion::factory()->for($article)->create(['status' => $status]);
}

test('um artigo pode ter, ao mesmo tempo, um rascunho, uma pendente e uma em vigor', function () {
    $article = Article::factory()->create();

    versionOf($article, VersionStatus::Draft);
    versionOf($article, VersionStatus::Pending);
    versionOf($article, VersionStatus::Approved);

    expect($article->versions()->count())->toBe(3);
});

test('o banco recusa um segundo rascunho, pendente ou em vigor no mesmo artigo (RF-351)', function (VersionStatus $status) {
    $article = Article::factory()->create();
    versionOf($article, $status);

    expect(fn () => versionOf($article, $status))->toThrow(UniqueConstraintViolationException::class);
})->with([VersionStatus::Draft, VersionStatus::Pending, VersionStatus::Approved]);

test('rejeitadas e substituídas se acumulam no histórico', function () {
    $article = Article::factory()->create();

    versionOf($article, VersionStatus::Rejected);
    versionOf($article, VersionStatus::Rejected);
    versionOf($article, VersionStatus::Superseded);
    versionOf($article, VersionStatus::Superseded);

    expect($article->versions()->count())->toBe(4);
});

test('artigos diferentes têm cada um o seu rascunho', function () {
    versionOf(Article::factory()->create(), VersionStatus::Draft);
    versionOf(Article::factory()->create(), VersionStatus::Draft);

    expect(ArticleVersion::query()->count())->toBe(2);
});

test('a lixeira guarda o estado, e a restauração o devolve (RF-340, RF-341)', function () {
    $article = Article::factory()->published()->create();

    $article->delete();

    expect(Article::query()->find($article->id))->toBeNull()
        ->and(Article::withTrashed()->find($article->id)->state)->toBe(ArticleState::Published);

    $article->restore();

    expect($article->fresh()->state)->toBe(ArticleState::Published)
        ->and($article->fresh()->currentVersion->status)->toBe(VersionStatus::Approved);
});

test('a categoria em uso não pode ser apagada direto no banco (RF-126)', function () {
    $category = Category::factory()->create();
    ArticleVersion::factory()->create(['category_id' => $category->id]);

    expect(fn () => $category->delete())->toThrow(QueryException::class);
});

test('o artigo sobrevive à conta, sem autoria', function () {
    $user = User::factory()->create();
    $article = Article::factory()->published()->for($user, 'author')->create();

    $user->delete();

    expect($article->fresh())->not->toBeNull()
        ->and($article->fresh()->user_id)->toBeNull();
});
