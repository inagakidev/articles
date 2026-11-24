<?php

use App\Domain\Audit\Actions\RecordAudit;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Audit\Exceptions\AuditLogIsAppendOnly;
use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Tag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Auditoria (RF-259, RF-291 a RF-293, D87): só inclusões, consulta e CSV.
 */

beforeEach(function () {
    $this->admin = User::factory()->admin()->create(['name' => 'Amanda Inagaki']);
});

test('o registro não aceita alteração nem remoção (RF-291)', function () {
    $log = app(RecordAudit::class)->handle($this->admin, AuditAction::TagBlocked, '#spam');

    expect(fn () => $log->update(['reason' => 'outra']))->toThrow(AuditLogIsAppendOnly::class)
        ->and(fn () => $log->delete())->toThrow(AuditLogIsAppendOnly::class)
        ->and(AuditLog::query()->count())->toBe(1);
});

test('as ações em categorias e tags entram na auditoria', function () {
    $tag = Tag::query()->create(['name' => 'ganhe-dinheiro', 'loose_key' => 'ganhedinheiro']);

    $this->actingAs($this->admin)->post(route('admin.categories.store'), [
        'name_pt_br' => 'Observabilidade', 'name_en' => 'Observability', 'color' => 'mint',
    ]);
    $this->actingAs($this->admin)->post(route('admin.tags.block', $tag));
    $this->actingAs($this->admin)->delete(route('admin.tags.destroy', $tag));

    expect(AuditLog::query()->orderBy('id')->pluck('action')->all())->toBe([
        AuditAction::CategoryCreated, AuditAction::TagBlocked, AuditAction::TagDeleted,
    ])->and(AuditLog::query()->where('action', AuditAction::TagBlocked)->value('actor_id'))->toBe($this->admin->id);
});

test('a lixeira vencida entra na auditoria, sem responsável', function () {
    $article = Article::factory()->published()->create();
    $article->delete();
    $this->travel(Article::TRASH_DAYS + 1)->days();

    $this->artisan('model:prune', ['--model' => [Article::class]])->assertSuccessful();

    $log = AuditLog::query()->sole();
    expect($log->action)->toBe(AuditAction::ArticleTrashExpired)
        ->and($log->actor_id)->toBeNull();
});

test('a página filtra por ação, período e busca', function () {
    $record = app(RecordAudit::class);
    $record->handle($this->admin, AuditAction::TagBlocked, '#spam', reason: 'Usada só em spam.');
    $this->travel(-40)->days();
    $record->handle($this->admin, AuditAction::CategoryCreated, 'DevOps');
    $this->travelBack();

    $this->actingAs($this->admin)->get(route('admin.audit'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/audit')
            ->where('records.total', 2)
            ->where('records.data.0.target', '#spam')
            ->where('records.data.0.actor', 'Amanda Inagaki'));
    $this->actingAs($this->admin)->get(route('admin.audit', ['periodo' => 30]))
        ->assertInertia(fn (Assert $page) => $page->where('records.total', 1));
    $this->actingAs($this->admin)->get(route('admin.audit', ['acao' => 'category_created']))
        ->assertInertia(fn (Assert $page) => $page->where('records.total', 1)->where('records.data.0.target', 'DevOps'));
    $this->actingAs($this->admin)->get(route('admin.audit', ['q' => 'spam']))
        ->assertInertia(fn (Assert $page) => $page->where('records.total', 1));
});

test('exporta o filtro em CSV', function () {
    app(RecordAudit::class)->handle($this->admin, AuditAction::TagBlocked, '#spam', policyItem: '1.2', reason: 'Usada só em spam.');

    $response = $this->actingAs($this->admin)->get(route('admin.audit.export'));
    $response->assertOk();
    $csv = $response->streamedContent();

    expect($csv)->toContain('#spam')->toContain('1.2')->toContain('Amanda Inagaki');
});

test('só a administradora consulta a auditoria', function () {
    $this->actingAs(User::factory()->create())->get(route('admin.audit'))->assertForbidden();
    $this->actingAs(User::factory()->create())->get(route('admin.audit.export'))->assertForbidden();
});
