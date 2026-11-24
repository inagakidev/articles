<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Audit\Enums\AuditAction;
use App\Models\Article;
use App\Models\ArticleImage;
use App\Models\ArticleVersion;
use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\Articles\ArticleDeleted;
use App\Notifications\Articles\ArticleUnpublished;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Despublicar e excluir de vez pela administradora (RF-111, RF-122, D87).
 */

beforeEach(function () {
    Notification::fake();
    $this->admin = User::factory()->admin()->create();
    $this->decision = ['policy_item' => '1.2', 'reason' => 'Links de afiliado sem aviso.'];
});

test('a leitura oferece a moderação só para a administradora', function () {
    $article = Article::factory()->published()->create();

    $this->actingAs($this->admin)->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('moderation.articleId', $article->id)
            ->where('moderation.policyItems', fn ($items) => count($items) > 0));
    $this->actingAs(User::factory()->create())->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page->where('moderation', null));
});

test('despublicar tira do ar e devolve a quem escreveu pelo fluxo da rejeição', function () {
    $article = Article::factory()->published()->create();
    $current = $article->current_version_id;
    $slug = $article->slug;

    $this->actingAs($this->admin)
        ->post(route('admin.articles.unpublish', $article), $this->decision)
        ->assertRedirect(route('articles.index'));

    $article->refresh();
    expect($article->state)->toBe(ArticleState::Unpublished)
        ->and($article->current_version_id)->toBeNull()
        ->and($article->slug)->toBe($slug)
        ->and(ArticleVersion::query()->find($current))
        ->status->toBe(VersionStatus::Rejected)
        ->decision_policy_item->toBe('1.2');
    $this->get(route('articles.show', $slug))->assertNotFound();
    Notification::assertSentTo($article->author, ArticleUnpublished::class);
    expect(AuditLog::query()->where('action', AuditAction::ArticleUnpublished)->value('reason'))->toBe('Links de afiliado sem aviso.');

    $this->actingAs($article->author)->get(route('articles.mine'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('sections.rejected.0.id', $article->id)
            ->where('sections.rejected.0.policyItem', '1.2'));
});

test('despublicar exige o item e a justificativa', function () {
    $article = Article::factory()->published()->create();

    $this->actingAs($this->admin)
        ->post(route('admin.articles.unpublish', $article), [])
        ->assertSessionHasErrors(['policy_item', 'reason']);
    expect($article->fresh()->state)->toBe(ArticleState::Published);
});

test('excluir de vez apaga o artigo e as imagens, registra sem o conteúdo e avisa', function () {
    Storage::fake('media');
    $article = Article::factory()->published()->create();
    $title = $article->currentVersion->title;
    $image = ArticleImage::factory()->for($article)->create();
    Storage::disk('media')->put($image->path(), 'original');

    $this->actingAs($this->admin)
        ->delete(route('admin.articles.destroy', $article), $this->decision)
        ->assertRedirect(route('articles.index'));

    expect(Article::withTrashed()->find($article->id))->toBeNull()
        ->and(Storage::disk('media')->exists($image->path()))->toBeFalse();
    $log = AuditLog::query()->where('action', AuditAction::ArticleDeleted)->firstOrFail();
    expect($log->subject_label)->toContain($title)
        ->and($log->details)->toBeNull();
    Notification::assertSentTo($article->author, ArticleDeleted::class, fn (ArticleDeleted $mail) => $mail->title === $title);
});

test('excluir de vez também vale para artigo na lixeira', function () {
    $article = Article::factory()->published()->create();
    $article->delete();

    $this->actingAs($this->admin)->delete(route('admin.articles.destroy', $article), $this->decision);

    expect(Article::withTrashed()->find($article->id))->toBeNull();
});

test('só a administradora despublica e exclui', function () {
    $article = Article::factory()->published()->create();
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('admin.articles.unpublish', $article), $this->decision)->assertForbidden();
    $this->actingAs($user)->delete(route('admin.articles.destroy', $article), $this->decision)->assertForbidden();
    expect($article->fresh()->state)->toBe(ArticleState::Published);
});
