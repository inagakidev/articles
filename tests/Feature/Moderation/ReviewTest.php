<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Domain\Audit\Enums\AuditAction;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\AuditLog;
use App\Models\User;
use App\Notifications\Articles\VersionApproved;
use App\Notifications\Articles\VersionRejected;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Revisão: aprovar e rejeitar (RF-101 a RF-110, RF-324 a RF-327, D87).
 */

beforeEach(function () {
    Notification::fake();
    $this->admin = User::factory()->admin()->create();
});

function pendingVersion(array $article = [], array $version = []): ArticleVersion
{
    $owner = Article::factory()->create($article);

    return ArticleVersion::factory()->for($owner)->create([
        'status' => VersionStatus::Pending,
        'submitted_at' => now()->subHour(),
        'title' => 'Filas no Laravel',
        ...$version,
    ]);
}

test('aprovar publica o artigo, com o endereço, e avisa quem escreveu', function () {
    $version = pendingVersion();

    $this->actingAs($this->admin)
        ->post(route('admin.review.decide', $version), ['decision' => 'approve'])
        ->assertRedirect(route('admin.queue'));

    $article = $version->article->fresh();
    expect($version->fresh()->status)->toBe(VersionStatus::Approved)
        ->and($version->fresh()->decided_by_id)->toBe($this->admin->id)
        ->and($article->state)->toBe(ArticleState::Published)
        ->and($article->current_version_id)->toBe($version->id)
        ->and($article->first_published_at)->not->toBeNull()
        ->and($article->slug)->toBe('filas-no-laravel');

    $this->get(route('articles.show', 'filas-no-laravel'))->assertOk();
    Notification::assertSentTo($article->author, VersionApproved::class, fn (VersionApproved $mail) => ! $mail->edit);
    expect(AuditLog::query()->where('action', AuditAction::VersionApproved)->value('subject_label'))
        ->toBe('“Filas no Laravel” de @'.$article->author->username);
});

test('aprovar uma edição substitui a versão em vigor, sem mudar o endereço nem a data', function () {
    $article = Article::factory()->published()->create();
    $article->forceFill(['first_published_at' => now()->subMonth()])->save();
    $old = $article->current_version_id;
    $slug = $article->slug;
    $edit = ArticleVersion::factory()->for($article)->create(['status' => VersionStatus::Pending, 'submitted_at' => now(), 'title' => 'Título novo']);

    $this->actingAs($this->admin)->post(route('admin.review.decide', $edit), ['decision' => 'approve']);

    $article->refresh();
    expect(ArticleVersion::query()->find($old)->status)->toBe(VersionStatus::Superseded)
        ->and($article->current_version_id)->toBe($edit->id)
        ->and($article->slug)->toBe($slug)
        ->and($article->first_published_at->isSameDay(now()->subMonth()))->toBeTrue();
    Notification::assertSentTo($article->author, VersionApproved::class, fn (VersionApproved $mail) => $mail->edit);
});

test('rejeitar guarda o item e a justificativa, e a versão publicada continua no ar', function () {
    $article = Article::factory()->published()->create();
    $edit = ArticleVersion::factory()->for($article)->create(['status' => VersionStatus::Pending, 'submitted_at' => now()]);

    $this->actingAs($this->admin)->post(route('admin.review.decide', $edit), [
        'decision' => 'reject',
        'policy_item' => '4.2',
        'reason' => 'Os números de desempenho precisam de fonte.',
    ])->assertRedirect();

    expect($edit->fresh())
        ->status->toBe(VersionStatus::Rejected)
        ->decision_policy_item->toBe('4.2')
        ->decision_reason->toBe('Os números de desempenho precisam de fonte.')
        ->and($article->fresh()->state)->toBe(ArticleState::Published);
    $this->get(route('articles.show', $article->slug))->assertOk();
    Notification::assertSentTo($article->author, VersionRejected::class, fn (VersionRejected $mail) => $mail->edit && $mail->policyItem === '4.2');
    expect(AuditLog::query()->where('action', AuditAction::VersionRejected)->first())
        ->policy_item->toBe('4.2')
        ->reason->toBe('Os números de desempenho precisam de fonte.');
});

test('rejeitar exige um item que existe na Política e uma justificativa (RF-107)', function () {
    $version = pendingVersion();

    $this->actingAs($this->admin)
        ->post(route('admin.review.decide', $version), ['decision' => 'reject'])
        ->assertSessionHasErrors(['policy_item', 'reason']);

    $this->actingAs($this->admin)
        ->post(route('admin.review.decide', $version), ['decision' => 'reject', 'policy_item' => '9.9', 'reason' => 'curta'])
        ->assertSessionHasErrors(['policy_item', 'reason']);

    expect($version->fresh()->status)->toBe(VersionStatus::Pending);
});

test('versão retirada durante a análise: a decisão é recusada com aviso (RF-105)', function () {
    $version = pendingVersion();
    $version->forceFill(['status' => VersionStatus::Draft, 'submitted_at' => null])->save();

    $this->actingAs($this->admin)
        ->post(route('admin.review.decide', $version), ['decision' => 'approve'])
        ->assertRedirect(route('admin.queue'))
        ->assertInertiaFlash('toast.type', 'warning');

    expect($version->fresh()->status)->toBe(VersionStatus::Draft)
        ->and(AuditLog::query()->count())->toBe(0);
    Notification::assertNothingSent();
});

test('a revisão mostra o retrato congelado, o resumo e os itens da Política', function () {
    $version = pendingVersion(version: [
        'submitted_at' => now()->subHours(7),
        'content' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [
            ['type' => 'text', 'text' => 'Veja a ', 'marks' => []],
            ['type' => 'text', 'text' => 'documentação', 'marks' => [['type' => 'link', 'attrs' => ['href' => 'https://laravel.com/docs']]]],
        ]]]],
    ]);

    $this->actingAs($this->admin)->get(route('admin.review', $version))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/review')
            ->where('version.id', $version->id)
            ->where('version.late', true)
            ->where('version.edit', false)
            ->where('version.links', 1)
            ->where('article.title', 'Filas no Laravel')
            ->where('policyItems', fn ($items) => collect($items)->contains('id', '4.2'))
            ->where('queue.count', 1),
        );
});

test('versão que saiu da fila volta para a fila com aviso', function () {
    $version = pendingVersion();
    $version->forceFill(['status' => VersionStatus::Rejected])->save();

    $this->actingAs($this->admin)->get(route('admin.review', $version))->assertRedirect(route('admin.queue'));
});

test('depois de decidir, segue para a próxima da fila', function () {
    $first = pendingVersion(version: ['submitted_at' => now()->subHours(3)]);
    $second = pendingVersion(version: ['submitted_at' => now()->subHour()]);

    $this->actingAs($this->admin)
        ->post(route('admin.review.decide', $first), ['decision' => 'approve'])
        ->assertRedirect(route('admin.review', $second));
});

test('só a administradora revisa', function () {
    $version = pendingVersion();
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.review', $version))->assertForbidden();
    $this->actingAs($user)->post(route('admin.review.decide', $version), ['decision' => 'approve'])->assertForbidden();
    expect($version->fresh()->status)->toBe(VersionStatus::Pending);
});
