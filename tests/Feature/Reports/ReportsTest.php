<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Audit\Enums\AuditAction;
use App\Domain\Reports\Enums\ReportStatus;
use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Comment;
use App\Models\Report;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Denúncias (RF-164 a RF-178, RF-186, RF-187, D91).
 */

beforeEach(function () {
    $this->author = User::factory()->create();
    $this->article = Article::factory()->for($this->author, 'author')->published()->create();
    $this->reader = User::factory()->create();
    $this->admin = User::factory()->admin()->create();
});

function reportAs(User $reporter, string $target, int $id, string $reason = 'spam', ?string $details = null)
{
    return test()->actingAs($reporter)->post(route('reports.store'), array_filter([
        'target' => $target, 'id' => $id, 'reason' => $reason, 'details' => $details,
    ]));
}

test('conta confirmada denuncia artigo, comentário e perfil; o conteúdo segue no ar (RF-164, RF-165)', function () {
    $comment = Comment::factory()->for($this->article)->create();

    reportAs($this->reader, 'article', $this->article->id)->assertRedirect()->assertSessionHasNoErrors();
    reportAs($this->reader, 'comment', $comment->id, 'offensive');
    reportAs($this->reader, 'profile', $this->author->id, 'other', 'Username é propaganda.');

    expect(Report::query()->count())->toBe(3)
        ->and(Report::query()->where('target', 'profile')->value('details'))->toBe('Username é propaganda.');
    $this->get(route('articles.show', $this->article->slug))->assertOk();

    $this->actingAs($this->reader)->get(route('articles.show', $this->article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('report.canReport', true)
            ->where('report.reported', true)
            ->where('comments.items.0.can.report', true)
            ->where('comments.items.0.reported', true));
});

test('"outro" pede detalhes; motivo desconhecido é recusado (RF-166)', function () {
    reportAs($this->reader, 'article', $this->article->id, 'other')->assertSessionHasErrors('details');
    reportAs($this->reader, 'article', $this->article->id, 'boring')->assertSessionHasErrors('reason');

    expect(Report::query()->count())->toBe(0);
});

test('uma denúncia aberta por pessoa e item; depois da decisão, pode denunciar de novo (RF-167)', function () {
    reportAs($this->reader, 'article', $this->article->id);
    reportAs($this->reader, 'article', $this->article->id)->assertSessionHasErrors('reason');
    expect(Report::query()->count())->toBe(1);

    $this->actingAs($this->admin)->post(route('admin.reports.decide', ['article', $this->article->id]), [
        'outcome' => 'dismiss', 'reason' => 'Não é spam: o link é a fonte.',
    ]);

    reportAs($this->reader, 'article', $this->article->id)->assertSessionHasNoErrors();
    expect(Report::query()->count())->toBe(2);
});

test('ninguém denuncia o que é seu; a autora denuncia comentários no artigo dela (RF-168, RF-169)', function () {
    $mine = Comment::factory()->for($this->article)->create(['user_id' => $this->reader->id]);
    $other = Comment::factory()->for($this->article)->create();

    reportAs($this->author, 'article', $this->article->id)->assertSessionHasErrors('reason');
    reportAs($this->author, 'profile', $this->author->id)->assertSessionHasErrors('reason');
    reportAs($this->reader, 'comment', $mine->id)->assertSessionHasErrors('reason');
    reportAs($this->author, 'comment', $other->id)->assertSessionHasNoErrors();

    expect(Report::query()->count())->toBe(1);
});

test('visitante e conta sem confirmar não denunciam; artigo fora do ar também não', function () {
    $this->post(route('reports.store'), ['target' => 'article', 'id' => $this->article->id, 'reason' => 'spam'])
        ->assertRedirect(route('login'));
    reportAs(User::factory()->unverified()->create(), 'article', $this->article->id)->assertRedirect(route('verification.notice'));
    reportAs($this->reader, 'article', Article::factory()->create()->id)->assertSessionHasErrors('reason');

    expect(Report::query()->count())->toBe(0);
});

test('o painel agrupa por item e mostra o conteúdo como está agora, sem quem denunciou', function () {
    $comment = Comment::factory()->for($this->article)->create(['body' => 'Volta pro tutorial.']);
    reportAs($this->reader, 'comment', $comment->id, 'offensive', 'Ataque pessoal à autora.');
    reportAs(User::factory()->create(), 'comment', $comment->id, 'offensive');
    reportAs($this->reader, 'article', $this->article->id);

    $this->actingAs($this->admin)->get(route('admin.reports'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports')
            ->where('openCount', 2)
            ->where('groups.total', 2)
            ->where('groups.data.0.target', 'comment')
            ->where('groups.data.0.count', 2));

    $this->actingAs($this->admin)->get(route('admin.reports.show', ['comment', $comment->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('selected.item.text', 'Volta pro tutorial.')
            ->where('selected.reasons', ['offensive' => 2])
            ->where('selected.details', ['Ataque pessoal à autora.'])
            ->where('selected.outcomes', ['delete_comment', 'dismiss'])
            ->where('neighbours.next', ['target' => 'article', 'id' => $this->article->id])
            ->missing('selected.reporters'));

    $this->actingAs($this->reader)->get(route('admin.reports'))->assertForbidden();
});

test('procedente: exclui o comentário, encerra todas as denúncias e avisa quem denunciou (RF-171, RF-172, RF-177)', function () {
    $comment = Comment::factory()->for($this->article)->create();
    $other = User::factory()->create();
    reportAs($this->reader, 'comment', $comment->id, 'offensive');
    reportAs($other, 'comment', $comment->id, 'offensive');

    $this->actingAs($this->admin)
        ->post(route('admin.reports.decide', ['comment', $comment->id]), [
            'outcome' => 'delete_comment', 'policy_item' => '2.1', 'reason' => 'Ataque pessoal à autora.',
        ])
        ->assertRedirect(route('admin.reports'));

    expect(Comment::query()->find($comment->id))->toBeNull()
        ->and(Report::query()->pluck('status')->all())->toBe([ReportStatus::Upheld, ReportStatus::Upheld])
        ->and(Report::query()->first()->decided_by_id)->toBe($this->admin->id)
        ->and(Report::query()->first()->policy_item)->toBe('2.1')
        ->and(AuditLog::query()->where('action', AuditAction::CommentDeleted)->exists())->toBeTrue()
        ->and($this->reader->notifications()->sole()->type)->toBe('report.reviewed')
        ->and($this->reader->notifications()->sole()->data)->toBe([])
        ->and($other->notifications()->count())->toBe(1);
});

test('procedente: despublica o artigo (RF-176)', function () {
    reportAs($this->reader, 'article', $this->article->id);

    $this->actingAs($this->admin)
        ->post(route('admin.reports.decide', ['article', $this->article->id]), ['outcome' => 'unpublish_article', 'reason' => 'Propaganda sem conteúdo.'])
        ->assertSessionHasErrors('policy_item');

    $this->actingAs($this->admin)
        ->post(route('admin.reports.decide', ['article', $this->article->id]), ['outcome' => 'unpublish_article', 'policy_item' => '1.2', 'reason' => 'Propaganda sem conteúdo.'])
        ->assertSessionHasNoErrors();

    expect($this->article->fresh()->state)->toBe(ArticleState::Unpublished)
        ->and(Report::query()->sole()->status)->toBe(ReportStatus::Upheld);
});

test('improcedente não pede item e fica na auditoria', function () {
    reportAs($this->reader, 'article', $this->article->id);

    $this->actingAs($this->admin)
        ->post(route('admin.reports.decide', ['article', $this->article->id]), ['outcome' => 'dismiss', 'reason' => 'O link é a fonte citada.'])
        ->assertSessionHasNoErrors();

    expect(Report::query()->sole()->status)->toBe(ReportStatus::Dismissed)
        ->and(Report::query()->sole()->policy_item)->toBeNull()
        ->and(AuditLog::query()->where('action', AuditAction::ReportDismissed)->value('reason'))->toBe('O link é a fonte citada.');
});

test('perfil: redefine foto e bio, e exige a troca do username (RF-178, RF-187)', function () {
    $this->author->forceFill(['bio' => 'Compre cursos!'])->save();
    reportAs($this->reader, 'profile', $this->author->id, 'spam');

    $this->actingAs($this->admin)
        ->post(route('admin.reports.decide', ['profile', $this->author->id]), ['outcome' => 'moderate_profile', 'policy_item' => '1.2', 'reason' => 'Perfil usado para propaganda.'])
        ->assertSessionHasErrors('outcome');

    $this->actingAs($this->admin)
        ->post(route('admin.reports.decide', ['profile', $this->author->id]), [
            'outcome' => 'moderate_profile', 'bio' => '1', 'username' => '1', 'policy_item' => '1.2', 'reason' => 'Perfil usado para propaganda.',
        ])
        ->assertSessionHasNoErrors();

    $author = $this->author->fresh();
    expect($author->bio)->toBeNull()
        ->and($author->username_change_required_at)->not->toBeNull()
        ->and($author->username_change_policy_item)->toBe('1.2')
        ->and(AuditLog::query()->where('action', AuditAction::ProfileModerated)->value('details'))->toBe(['reset' => ['bio', 'username']])
        ->and($author->notifications()->sole()->type)->toBe('profile.moderated');
});

test('conteúdo excluído antes da análise encerra a denúncia como removido (RF-175)', function () {
    $comment = Comment::factory()->for($this->article)->create();
    $reply = Comment::factory()->replyTo($comment)->create();
    reportAs($this->reader, 'comment', $reply->id);
    reportAs($this->reader, 'article', $this->article->id);

    $comment->delete();
    expect(Report::query()->where('target', 'comment')->sole()->status)->toBe(ReportStatus::Removed);

    $this->article->forceDelete();
    expect(Report::query()->where('target', 'article')->sole()->status)->toBe(ReportStatus::Removed);
});

test('decidir de novo um item já decidido é recusado', function () {
    reportAs($this->reader, 'article', $this->article->id);
    $decide = fn () => $this->actingAs($this->admin)->post(route('admin.reports.decide', ['article', $this->article->id]), ['outcome' => 'dismiss', 'reason' => 'O link é a fonte citada.']);

    $decide();
    $decide()->assertRedirect(route('admin.reports'));

    expect(AuditLog::query()->where('action', AuditAction::ReportDismissed)->count())->toBe(1);
});
