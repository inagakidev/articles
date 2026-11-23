<?php

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\User;

/*
 * Envio para a revisão e retirada da fila (RF-303, RF-318, RF-344, RF-345,
 * RF-102 a RF-104).
 */

/** @return array{0: User, 1: Article, 2: ArticleVersion} */
function readyDraft(array $attributes = []): array
{
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->create();
    $draft = ArticleVersion::factory()->for($article)->create([
        'title' => 'Filas no Laravel',
        'language' => 'pt_BR',
        'category_id' => Category::query()->value('id'),
        ...$attributes,
    ]);

    return [$user, $article, $draft];
}

test('o rascunho completo vai para a fila e o autor volta a Meus artigos com o aviso', function () {
    [$user, $article, $draft] = readyDraft();

    $this->actingAs($user)
        ->post(route('articles.submission.store', $article))
        ->assertRedirect(route('articles.mine'))
        ->assertInertiaFlash('submitted', ['articleId' => $article->id, 'title' => 'Filas no Laravel']);

    $draft->refresh();

    expect($draft->status)->toBe(VersionStatus::Pending)
        ->and($draft->submitted_at)->not->toBeNull();
});

test('o que falta para enviar é recusado com o motivo de cada campo (RF-318)', function (array $attributes, string $field) {
    [$user, $article, $draft] = readyDraft($attributes);

    $this->actingAs($user)
        ->post(route('articles.submission.store', $article))
        ->assertSessionHasErrors($field);

    expect($draft->fresh()->status)->toBe(VersionStatus::Draft);
})->with([
    'sem título' => [['title' => '  '], 'title'],
    'sem conteúdo' => [['content' => ['type' => 'doc', 'content' => []], 'content_text' => ''], 'content'],
    'sem categoria' => [['category_id' => null], 'category'],
    'sem idioma' => [['language' => null], 'language'],
    'imagem sem texto alternativo' => [['content' => ['type' => 'doc', 'content' => [
        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Texto']]],
        ['type' => 'image', 'attrs' => ['id' => '0f8c6a4e-1b2c-4d3e-8f90-123456789abc']],
    ]]], 'images_alt'],
    'conteúdo fora do esquema' => [['content' => ['type' => 'doc', 'content' => [
        ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'x', 'marks' => [['type' => 'underline']]]]],
    ]]], 'content_schema'],
]);

test('capa sem texto alternativo também barra o envio; decorativa passa', function () {
    [$user, $article, $draft] = readyDraft();
    $cover = ArticleImage::factory()->for($article)->create();
    $draft->forceFill(['cover_image_id' => $cover->id])->save();

    $this->actingAs($user)->post(route('articles.submission.store', $article))->assertSessionHasErrors('images_alt');

    $draft->forceFill(['cover_decorative' => true])->save();

    $this->actingAs($user)->post(route('articles.submission.store', $article))->assertSessionHasNoErrors();
});

test('com outra versão na fila, o envio espera a retirada (RF-102)', function () {
    [$user, $article] = readyDraft();
    ArticleVersion::factory()->for($article)->create(['status' => VersionStatus::Pending]);

    $this->actingAs($user)
        ->post(route('articles.submission.store', $article))
        ->assertSessionHasErrors('pending');
});

test('só quem escreveu envia e retira', function () {
    [, $article] = readyDraft();
    $other = User::factory()->create();

    $this->actingAs($other)->post(route('articles.submission.store', $article))->assertForbidden();
    $this->actingAs($other)->delete(route('articles.submission.destroy', $article))->assertForbidden();
});

test('retirar da fila devolve a versão a rascunho (RF-345)', function () {
    [$user, $article, $draft] = readyDraft();
    $draft->forceFill(['status' => VersionStatus::Pending, 'submitted_at' => now()])->save();

    $this->actingAs($user)->delete(route('articles.submission.destroy', $article))->assertRedirect();

    expect($draft->fresh()->status)->toBe(VersionStatus::Draft)
        ->and($draft->fresh()->submitted_at)->toBeNull();
});

test('com um rascunho mais novo, retirar pede a escolha e descarta a outra (RF-104)', function (string $keep) {
    [$user, $article, $pending] = readyDraft(['title' => 'Na fila']);
    $pending->forceFill(['status' => VersionStatus::Pending, 'submitted_at' => now()])->save();
    $draft = ArticleVersion::factory()->for($article)->create(['title' => 'Mais novo']);

    $this->actingAs($user)->delete(route('articles.submission.destroy', $article))->assertSessionHasErrors('keep');
    expect($article->versions()->count())->toBe(2);

    $this->actingAs($user)->delete(route('articles.submission.destroy', $article), ['keep' => $keep])->assertSessionHasNoErrors();

    $remaining = $article->versions()->sole();

    expect($remaining->status)->toBe(VersionStatus::Draft)
        ->and($remaining->title)->toBe($keep === 'draft' ? 'Mais novo' : 'Na fila');
})->with(['draft', 'pending']);

test('retirar sem nada na fila não muda nada', function () {
    [$user, $article, $draft] = readyDraft();

    $this->actingAs($user)->delete(route('articles.submission.destroy', $article))->assertRedirect();

    expect($draft->fresh()->status)->toBe(VersionStatus::Draft);
});

test('artigo publicado: a edição vai para a fila e a versão em vigor continua (RF-330)', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->published()->create();
    $current = $article->currentVersion;

    $this->actingAs($user)->putJson(route('articles.draft.update', $article), ['title' => 'Edição'])->assertOk();
    $this->actingAs($user)->post(route('articles.submission.store', $article))->assertSessionHasNoErrors();

    expect($article->versions()->where('status', VersionStatus::Pending)->sole()->title)->toBe('Edição')
        ->and($article->fresh()->current_version_id)->toBe($current->id)
        ->and($current->fresh()->status)->toBe(VersionStatus::Approved);
});
