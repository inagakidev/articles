<?php

use App\Domain\Moderation\Enums\AppealStatus;
use App\Domain\Moderation\Enums\PenaltyType;
use App\Models\Appeal;
use App\Models\Article;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Penalty;
use App\Models\User;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Fortify;

/*
 * Regras das penalidades corrigidas na revisão (D92).
 */

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->user = User::factory()->create(['username' => 'caio-lima']);
});

function penalize(User $user, string $type = 'suspend', array $data = [])
{
    return test()->actingAs(test()->admin)->post(route("admin.users.{$type}", $user), [
        'days' => 7, 'policy_item' => '2.1', 'reason' => 'Comentário ofensivo contra a autora.', ...$data,
    ]);
}

test('ninguém penaliza a si mesma nem outra administradora', function () {
    penalize(User::factory()->admin()->create(), 'ban')->assertSessionHas('inertia.flash_data.toast.type', 'error');
    penalize($this->admin)->assertSessionHas('inertia.flash_data.toast.type', 'error');

    expect(Penalty::query()->count())->toBe(0);
});

test('suspensão só de 7, 15 ou 30 dias, com item e justificativa de verdade', function () {
    penalize($this->user, data: ['days' => 10])->assertSessionHasErrors('days');
    penalize($this->user, data: ['reason' => ''])->assertSessionHasErrors('reason');
    penalize($this->user, data: ['days' => 15])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('inertia.flash_data.toast.type', 'success');

    expect(Penalty::query()->sole()->reason)->toBe('Comentário ofensivo contra a autora.');
});

test('quem está logada e penalizada consegue enviar a contestação', function () {
    penalize($this->user);
    $penalty = Penalty::query()->sole();

    $this->actingAs($this->user->fresh())
        ->post(URL::temporarySignedRoute('penalty.appeal.submit', $penalty->appeal_deadline_at, ['penalty' => $penalty->id]), [
            'justification' => 'O comentário foi tirado de contexto, veja a conversa inteira.',
        ])
        ->assertSessionHasNoErrors();

    expect(Appeal::query()->count())->toBe(1);
});

test('reabrir vale só para o prazo de banimento retido, vencido e sem pedido (RF-233, RF-234)', function () {
    penalize($this->user, 'ban');
    $penalty = Penalty::query()->sole();

    // Ainda no prazo: nada a reabrir
    $this->actingAs($this->admin)->post(route('admin.penalties.reopen', $penalty))->assertSessionHas('inertia.flash_data.toast.type', 'error');

    $this->travel(8)->days();
    $this->actingAs($this->admin)->post(route('admin.penalties.reopen', $penalty))->assertSessionHas('inertia.flash_data.toast.type', 'success');
    expect($penalty->fresh()->appeal_deadline_at->isFuture())->toBeTrue();

    // Com contestação rejeitada, não há segunda revisão
    Appeal::query()->create(['penalty_id' => $penalty->id, 'user_id' => $this->user->id, 'justification' => 'Pedido.', 'status' => AppealStatus::Rejected]);
    $this->travel(8)->days();
    $this->actingAs($this->admin)->post(route('admin.penalties.reopen', $penalty))->assertSessionHas('inertia.flash_data.toast.type', 'error');
});

test('conta banida é excluída só quando acaba a chance de contestar (RF-226)', function () {
    [$expired, $pending, $rejected, $early] = User::factory()->count(4)->create();
    foreach ([$expired, $pending, $rejected, $early] as $user) {
        penalize($user, 'ban');
    }
    $this->travel(8)->days();

    $appeal = fn (User $user, AppealStatus $status) => Appeal::query()->create([
        'penalty_id' => $user->penalties()->value('id'), 'user_id' => $user->id, 'justification' => 'Pedido.', 'status' => $status,
    ]);
    $appeal($pending, AppealStatus::Open);
    $appeal($rejected, AppealStatus::Rejected);
    // Uma suspensão antiga com contestação rejeitada não antecipa a exclusão do banimento
    $old = Penalty::query()->create([
        'user_id' => $early->id, 'type' => PenaltyType::Suspension, 'policy_item' => '1.2', 'reason' => 'Antiga.',
        'starts_at' => now()->subYear(), 'ends_at' => now()->subYear()->addDays(7), 'ended_at' => now()->subYear(),
    ]);
    Appeal::query()->create(['penalty_id' => $old->id, 'user_id' => $early->id, 'justification' => 'Pedido.', 'status' => AppealStatus::Rejected]);
    $early->penalties()->where('type', PenaltyType::Ban)->update(['appeal_deadline_at' => now()->addDay()]);

    $this->artisan('model:prune', ['--model' => [User::class]]);

    expect(User::query()->find($expired->id))->toBeNull()
        ->and(User::query()->find($rejected->id))->toBeNull()
        ->and(User::query()->find($pending->id))->not->toBeNull()
        ->and(User::query()->find($early->id))->not->toBeNull();
});

test('o conteúdo de conta penalizada sai de vista; o de conta excluída continua (RF-051, RF-208, RF-211)', function () {
    $article = Article::factory()->published()->create();
    Comment::factory()->for($article)->count(2)->create();
    Comment::factory()->for($article)->create(['user_id' => $this->user->id]);
    $orphan = Article::factory()->published()->create();
    $orphan->author->delete();

    penalize($this->user);
    auth()->logout();

    $this->get(route('articles.show', $orphan->fresh()->slug))->assertOk();
    $this->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page->where('comments.total', 2)->has('comments.items', 2));
    $this->get('/@caio-lima')->assertNotFound();
});

test('lixeira e notificações de quem está suspensa não são limpas; a reativação empurra os prazos (RF-214, RF-215)', function () {
    $trashed = Article::factory()->for($this->user, 'author')->create();
    $trashed->delete();
    $notice = $this->user->notifications()->create(['id' => (string) str()->uuid(), 'type' => 'report.reviewed', 'data' => []]);

    penalize($this->user, data: ['days' => 30]);
    $this->travel(20)->days();
    $this->artisan('model:prune', ['--model' => [Article::class, Notification::class]]);

    expect(Article::withTrashed()->find($trashed->id))->not->toBeNull()
        ->and(Notification::query()->find($notice->id))->not->toBeNull();

    $this->actingAs($this->admin)->post(route('admin.users.reactivate', $this->user));

    expect(Notification::query()->find($notice->id)->updated_at->greaterThan($notice->updated_at))->toBeTrue();
});

test('o painel busca contas sem curinga solto e mostra a conta com o histórico', function () {
    User::factory()->create(['name' => 'Ana 100%']);
    penalize($this->user);

    $this->actingAs($this->admin)->get(route('admin.users', ['q' => '%']))
        ->assertInertia(fn (Assert $page) => $page->where('users.total', 1)->where('users.data.0.name', 'Ana 100%'));

    $this->actingAs($this->admin)->get(route('admin.users.show', $this->user))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/user')
            ->where('penalties.0.status', 'active')
            ->where('canPenalize', false)
            ->where('durations', [7, 15, 30]));
});

test('entrar pelo convite volta para a página de onde a pessoa veio, só dentro do site (D94)', function () {
    $article = Article::factory()->published()->create();
    $path = '/artigos/'.$article->slug;

    $this->get(route('login', ['redirect' => $path]))->assertOk();
    $this->post(route('login.store'), ['email' => $this->user->email, 'password' => 'password'])->assertRedirect($path);

    auth()->logout();
    $this->flushSession();
    $this->get(route('login', ['redirect' => '//evil.example/x']))->assertOk();
    $this->post(route('login.store'), ['email' => $this->user->email, 'password' => 'password'])->assertRedirect(Fortify::redirects('login'));
});

test('a leitura mostra a contagem pública de favoritos (RF-161)', function () {
    $article = Article::factory()->published()->create();
    $article->favorites()->create(['user_id' => $this->user->id]);

    $this->get(route('articles.show', $article->slug))
        ->assertInertia(fn (Assert $page) => $page->where('favorites.count', 1)->where('favorites.canFavorite', false));
});
