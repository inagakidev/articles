<?php

use App\Domain\Audit\Enums\AuditAction;
use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Comment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Comentários (RF-138 a RF-147, RF-355 a RF-361, D88).
 */

beforeEach(function () {
    $this->article = Article::factory()->published()->create();
});

test('visitante lê os comentários, sem formulário (RF-140, RF-141)', function () {
    $comment = Comment::factory()->for($this->article)->create(['body' => 'Ótimo artigo.']);

    $this->get(route('articles.show', $this->article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('comments.total', 1)
            ->where('comments.canComment', false)
            ->where('comments.items.0.body', 'Ótimo artigo.')
            ->where('comments.items.0.author.username', $comment->author->username)
            ->where('comments.items.0.can.reply', false)
            ->missing('comments.items.0.author.email'));
});

test('conta confirmada comenta e responde; a árvore volta montada', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('comments.store', $this->article), ['body' => 'Primeiro!'])->assertRedirect();
    $parent = Comment::query()->sole();
    $this->travel(31)->seconds();
    $this->actingAs($user)->post(route('comments.store', $this->article), ['body' => 'Resposta', 'parent_id' => $parent->id]);

    $this->actingAs($user)->get(route('articles.show', $this->article->slug))
        ->assertInertia(fn (Assert $page) => $page
            ->where('comments.total', 2)
            ->where('comments.canComment', true)
            ->where('comments.items.0.own', true)
            ->where('comments.items.0.replies.0.body', 'Resposta')
            ->where('comments.items.0.replies.0.depth', 2));
});

test('conta sem confirmar não comenta', function () {
    $this->actingAs(User::factory()->unverified()->create())
        ->post(route('comments.store', $this->article), ['body' => 'Oi'])
        ->assertRedirect(route('verification.notice'));

    expect(Comment::query()->count())->toBe(0);
});

test('respostas vão até 3 níveis (RF-138)', function () {
    $first = Comment::factory()->for($this->article)->create();
    $second = Comment::factory()->replyTo($first)->create();
    $third = Comment::factory()->replyTo($second)->create();

    $this->actingAs(User::factory()->create())
        ->post(route('comments.store', $this->article), ['body' => 'Fundo demais', 'parent_id' => $third->id])
        ->assertSessionHasErrors('body');

    expect(Comment::query()->count())->toBe(3);
});

test('um comentário a cada 30 segundos e até 2.000 caracteres (RF-139)', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('comments.store', $this->article), ['body' => 'Um']);
    $this->actingAs($user)->post(route('comments.store', $this->article), ['body' => 'Dois'])
        ->assertSessionHasErrors('body');
    $this->travel(31)->seconds();
    $this->actingAs($user)->post(route('comments.store', $this->article), ['body' => str_repeat('a', 2001)])
        ->assertSessionHasErrors('body');

    expect(Comment::query()->count())->toBe(1);
});

test('artigo fora do ar não recebe comentários', function () {
    $this->article->delete();

    $this->actingAs(User::factory()->create())
        ->post(route('comments.store', $this->article->id), ['body' => 'Oi'])
        ->assertNotFound();
});

test('quem escreveu edita, e o comentário fica marcado como editado (RF-143)', function () {
    $comment = Comment::factory()->for($this->article)->create();

    $this->actingAs(User::factory()->create())
        ->put(route('comments.update', $comment), ['body' => 'Outro texto'])
        ->assertForbidden();
    $this->actingAs($comment->author)
        ->put(route('comments.update', $comment), ['body' => 'Corrigido'])
        ->assertRedirect();

    expect($comment->fresh())->body->toBe('Corrigido')->edited_at->not->toBeNull();
});

test('apagar leva as respostas junto, mesmo de outras pessoas (RF-146)', function () {
    $comment = Comment::factory()->for($this->article)->create();
    $reply = Comment::factory()->replyTo($comment)->create();
    Comment::factory()->replyTo($reply)->create();

    $this->actingAs($comment->author)->delete(route('comments.destroy', $comment))->assertRedirect();

    expect(Comment::query()->count())->toBe(0);
});

test('a autora do artigo apaga comentários no artigo dela (RF-144)', function () {
    $comment = Comment::factory()->for($this->article)->create();

    $this->actingAs(User::factory()->create())->delete(route('comments.destroy', $comment))->assertForbidden();
    $this->actingAs($this->article->author)->delete(route('comments.destroy', $comment))->assertRedirect();

    expect(Comment::query()->count())->toBe(0);
});

test('a administradora apaga como moderação, com item e justificativa na auditoria (RF-145)', function () {
    $admin = User::factory()->admin()->create();
    $comment = Comment::factory()->for($this->article)->create();

    $this->actingAs($admin)
        ->delete(route('comments.moderate', $comment), [])
        ->assertSessionHasErrors(['policy_item', 'reason']);
    $this->actingAs($admin)
        ->delete(route('comments.moderate', $comment), ['policy_item' => '2.1', 'reason' => 'Ataque pessoal à autora.'])
        ->assertRedirect();

    expect(Comment::query()->count())->toBe(0);
    $log = AuditLog::query()->sole();
    expect($log->action)->toBe(AuditAction::CommentDeleted)
        ->and($log->policy_item)->toBe('2.1')
        ->and($log->subject_label)->toContain('@'.$comment->author->username);

    $this->actingAs(User::factory()->create())
        ->delete(route('comments.moderate', Comment::factory()->for($this->article)->create()), ['policy_item' => '2.1', 'reason' => 'Ataque pessoal à autora.'])
        ->assertForbidden();
});

test('apagar a conta apaga os comentários dela (RF-361)', function () {
    $comment = Comment::factory()->for($this->article)->create();

    $comment->author->delete();

    expect(Comment::query()->count())->toBe(0);
});
