<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Meus artigos (RF-112 a RF-115): cada artigo aparece em uma única seção.
 */

function articleWith(User $user, VersionStatus ...$statuses): Article
{
    $article = Article::factory()->for($user, 'author')->create();

    foreach ($statuses as $status) {
        ArticleVersion::factory()->for($article)->create(['status' => $status, 'title' => $status->value]);
    }

    return $article;
}

test('cada artigo cai na seção do estado dele, e só nela', function () {
    $user = User::factory()->create();
    $draft = articleWith($user, VersionStatus::Draft);
    $review = articleWith($user, VersionStatus::Pending);
    $rejected = articleWith($user, VersionStatus::Rejected);
    // Pendente com um rascunho mais novo: o mais recente manda (RF-114)
    $editing = articleWith($user, VersionStatus::Pending, VersionStatus::Draft);
    $published = Article::factory()->for($user, 'author')->published()->create();
    $publishedEdit = Article::factory()->for($user, 'author')->published()->create();
    ArticleVersion::factory()->for($publishedEdit)->create(['status' => VersionStatus::Pending]);
    Article::factory()->create();
    articleWith($user, VersionStatus::Draft)->delete();

    $this->actingAs($user)->get(route('articles.mine'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('my-articles/index')
            ->where('sections.drafts', fn ($rows) => collect($rows)->pluck('id')->sort()->values()->all() === collect([$draft->id, $editing->id])->sort()->values()->all())
            ->where('sections.review.0.id', $review->id)
            ->where('sections.rejected.0.id', $rejected->id)
            ->has('sections.published', 2)
            ->where('trashCount', 1)
            ->where('reviewHours', 6),
        );
});

test('as linhas trazem o que a tela mostra: fila, edição pendente e justificativa', function () {
    $user = User::factory()->create();
    $editing = articleWith($user, VersionStatus::Pending, VersionStatus::Draft);
    $rejected = articleWith($user);
    ArticleVersion::factory()->for($rejected)->create([
        'status' => VersionStatus::Rejected,
        'decision_reason' => 'Faltam as fontes do benchmark.',
        'decided_at' => now(),
    ]);
    $published = Article::factory()->for($user, 'author')->published()->create();
    ArticleVersion::factory()->for($published)->create(['status' => VersionStatus::Pending, 'submitted_at' => now()]);

    $this->actingAs($user)->get(route('articles.mine'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('sections.drafts.0.id', $editing->id)
            ->where('sections.drafts.0.hasDraft', true)
            ->where('sections.rejected.0.reason', 'Faltam as fontes do benchmark.')
            ->where('sections.published.0.pendingSubmittedAt', fn ($value) => $value !== null)
            ->where('sections.published.0.editRejected', false),
        );
});

test('artigo publicado com edição rejeitada ganha o selo', function () {
    $user = User::factory()->create();
    $published = Article::factory()->for($user, 'author')->published()->create();
    ArticleVersion::factory()->for($published)->create(['status' => VersionStatus::Rejected]);

    $this->actingAs($user)->get(route('articles.mine'))
        ->assertInertia(fn (Assert $page) => $page->where('sections.published.0.editRejected', true));
});

test('despublicado vai para Não aprovados (RF-115)', function () {
    $user = User::factory()->create();
    $article = articleWith($user, VersionStatus::Rejected);
    $article->forceFill(['state' => ArticleState::Unpublished, 'first_published_at' => now()->subWeek()])->save();

    $this->actingAs($user)->get(route('articles.mine'))
        ->assertInertia(fn (Assert $page) => $page->where('sections.rejected.0.id', $article->id));
});

test('visitante vai para o login', function () {
    $this->get(route('articles.mine'))->assertRedirect(route('login'));
});
