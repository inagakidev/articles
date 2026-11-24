<?php

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\User;
use App\Notifications\Articles\VersionRejected;
use App\Support\Mail\Events\EmailBounced;
use App\Support\Mail\Events\EmailComplained;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Notificações dentro do site (RF-179 a RF-192, D90) e endereços que
 * deixam de receber e-mails (p6-17).
 */

beforeEach(function () {
    $this->author = User::factory()->create();
    $this->article = Article::factory()->for($this->author, 'author')->published()->create();
    $this->title = $this->article->currentVersion->title;
});

function noticesOf(User $user): array
{
    return $user->notifications()->get()->map(fn (Notification $n) => $n->type)->all();
}

test('aprovar avisa a autora dentro do site, com o link do artigo (RF-179)', function () {
    $version = ArticleVersion::factory()->for(Article::factory()->for($this->author, 'author')->create())->create([
        'status' => VersionStatus::Pending,
        'submitted_at' => now()->subHour(),
        'title' => 'Filas no Laravel',
    ]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.review.decide', $version), ['decision' => 'approve']);

    $notice = $this->author->notifications()->sole();
    expect($notice->type)->toBe('article.approved')
        ->and($notice->data)->toMatchArray(['title' => 'Filas no Laravel', 'url' => '/artigos/filas-no-laravel', 'edit' => false]);
});

test('rejeitar leva a Meus artigos, com o item da Política e sem a justificativa (RF-180)', function () {
    $this->author->notify(new VersionRejected('Filas', 'Texto copiado de outro site.', '4.2', false));

    $notice = $this->author->notifications()->sole();
    expect($notice->type)->toBe('article.rejected')
        ->and($notice->data)->toMatchArray(['policyItem' => '4.2', 'url' => route('articles.mine', absolute: false)])
        ->and($notice->data)->not->toHaveKey('reason');
});

test('comentário avisa a autora do artigo; resposta avisa quem foi respondido (RF-183, RF-185)', function () {
    $reader = User::factory()->create(['name' => 'Caio Lima']);
    $other = User::factory()->create();

    $this->actingAs($reader)->post(route('comments.store', $this->article), ['body' => 'O foco volta certinho para o botão?']);
    $first = Comment::query()->sole();

    expect(noticesOf($this->author))->toBe(['comment.posted']);
    $notice = $this->author->notifications()->sole();
    expect($notice->data)->toMatchArray([
        'title' => $this->title,
        'actor' => ['name' => 'Caio Lima', 'username' => $reader->username],
        'excerpt' => 'O foco volta certinho para o botão?',
        'url' => '/artigos/'.$this->article->slug.'#comentario-'.$first->id,
    ]);

    // Resposta de outra pessoa: Caio recebe "respondeu", a autora "comentou"
    $this->actingAs($other)->post(route('comments.store', $this->article), ['body' => 'Volta sim.', 'parent_id' => $first->id]);
    expect(noticesOf($reader))->toBe(['comment.replied'])
        ->and($this->author->notifications()->count())->toBe(2);

    // A autora responde: ninguém é avisado do que escreveu, e Caio recebe a resposta
    $this->actingAs($this->author)->post(route('comments.store', $this->article), ['body' => 'Obrigada!', 'parent_id' => $first->id]);
    expect($this->author->notifications()->count())->toBe(2)
        ->and($reader->notifications()->count())->toBe(2);
});

test('quem é autora do artigo e do comentário respondido recebe só o aviso da resposta', function () {
    $mine = Comment::factory()->for($this->article)->create(['user_id' => $this->author->id]);

    $this->actingAs(User::factory()->create())
        ->post(route('comments.store', $this->article), ['body' => 'Concordo.', 'parent_id' => $mine->id]);

    expect(noticesOf($this->author))->toBe(['comment.replied']);
});

test('curtidas viram um aviso só por item, sem dizer quem curtiu (RF-184)', function () {
    [$a, $b] = User::factory()->count(2)->create();

    $this->actingAs($a)->post(route('likes.article.store', $this->article));
    $this->actingAs($b)->post(route('likes.article.store', $this->article));
    // Descurtir e curtir de novo não conta a mesma pessoa duas vezes
    $this->actingAs($a)->delete(route('likes.article.destroy', $this->article));
    $this->actingAs($a)->post(route('likes.article.store', $this->article));

    $notice = $this->author->notifications()->sole();
    expect($notice->type)->toBe('like.received');

    $this->actingAs($this->author)->get(route('notifications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('list.data.0.count', 2)
            ->where('list.data.0.target', 'article')
            ->missing('list.data.0.likers'));

    // Depois de lido, a próxima curtida abre um aviso novo
    $notice->markAsRead();
    $this->actingAs(User::factory()->create())->post(route('likes.article.store', $this->article));
    expect($this->author->notifications()->count())->toBe(2);
});

test('curtida em comentário avisa quem escreveu o comentário', function () {
    $writer = User::factory()->create();
    $comment = Comment::factory()->for($this->article)->create(['user_id' => $writer->id]);

    $this->actingAs(User::factory()->create())->post(route('likes.comment.store', $comment));

    expect($writer->notifications()->sole()->data)->toMatchArray(['target' => 'comment', 'targetId' => $comment->id]);
});

test('abrir o sino não marca nada como lido; abrir o aviso marca e leva ao destino (RF-188)', function () {
    $this->actingAs(User::factory()->create())->post(route('comments.store', $this->article), ['body' => 'Oi']);
    $notice = $this->author->notifications()->sole();

    $this->actingAs($this->author)->get(route('notifications.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('notifications/index')
            ->where('unread', 1)
            ->where('list.data.0.read', false)
            ->where('list.data.0.href', '/notificacoes/'.$notice->id)
            ->where('auth.user.id', $this->author->id)
            ->where('list.data.0.type', 'comment.posted'));

    $this->actingAs($this->author)->get(route('articles.show', $this->article->slug))
        ->assertInertia(fn (Assert $page) => $page->where('notifications.unread', 1)->has('notifications.latest', 1));

    expect($notice->fresh()->read_at)->toBeNull();

    $this->actingAs($this->author)->get(route('notifications.open', $notice->id))
        ->assertRedirect($notice->data['url']);
    expect($notice->fresh()->read_at)->not->toBeNull();
});

test('marcar e excluir, uma por uma ou todas, só as próprias (RF-189, RF-190)', function () {
    foreach (range(1, 3) as $i) {
        $this->travel(31)->seconds();
        $this->actingAs(User::factory()->create())->post(route('comments.store', $this->article), ['body' => "Oi {$i}"]);
    }
    [$first, $second, $third] = $this->author->notifications()->get()->all();
    $stranger = User::factory()->create();

    $this->actingAs($stranger)->patch(route('notifications.read', $first->id))->assertNotFound();
    $this->actingAs($stranger)->delete(route('notifications.destroy', $first->id))->assertNotFound();
    $this->actingAs($stranger)->get(route('notifications.open', $first->id))->assertNotFound();

    $this->actingAs($this->author)->patch(route('notifications.read', $first->id))->assertRedirect();
    expect($first->fresh()->read_at)->not->toBeNull();

    $this->actingAs($this->author)->get(route('notifications.index', ['filtro' => 'nao-lidas']))
        ->assertInertia(fn (Assert $page) => $page->where('filter', 'nao-lidas')->where('list.total', 2));

    $this->actingAs($this->author)->delete(route('notifications.destroy', $second->id));
    $this->actingAs($this->author)->patch(route('notifications.read-all'));
    expect($third->fresh()->read_at)->not->toBeNull();

    $this->actingAs($this->author)->delete(route('notifications.clear-read'));
    expect($this->author->notifications()->count())->toBe(0);
});

test('notificações somem depois de 90 dias sem novidade (RF-191)', function () {
    $this->actingAs(User::factory()->create())->post(route('comments.store', $this->article), ['body' => 'Oi']);
    $this->travel(91)->days();
    $this->actingAs(User::factory()->create())->post(route('comments.store', $this->article), ['body' => 'Oi de novo']);

    $this->artisan('model:prune', ['--model' => [Notification::class]]);

    expect($this->author->notifications()->count())->toBe(1);
});

test('visitante não vê notificações', function () {
    $this->get(route('notifications.index'))->assertRedirect(route('login'));
    $this->get(route('articles.show', $this->article->slug))
        ->assertInertia(fn (Assert $page) => $page->where('notifications', null));
});

test('endereço que voltou ou reclamou deixa de receber e-mails (p6-17)', function () {
    $bounced = User::factory()->create();
    $complained = User::factory()->create();

    expect($bounced->routeNotificationForMail())->toBe($bounced->email);

    EmailBounced::dispatch($bounced->email);
    EmailComplained::dispatch($complained->email);

    expect($bounced->fresh()->routeNotificationForMail())->toBeNull()
        ->and($bounced->fresh()->email_suppressed_reason)->toBe('bounce')
        ->and($complained->fresh()->email_suppressed_reason)->toBe('complaint')
        ->and($this->author->fresh()->routeNotificationForMail())->toBe($this->author->email);
});
