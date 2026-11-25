<?php

use App\Domain\Moderation\Actions\BanUser;
use App\Domain\Moderation\Actions\DecideAppeal;
use App\Domain\Moderation\Actions\EndExpiredSuspensions;
use App\Domain\Moderation\Actions\SuspendUser;
use App\Domain\Moderation\Enums\AppealStatus;
use App\Domain\Moderation\Enums\PenaltyType;
use App\Models\Appeal;
use App\Models\Article;
use App\Models\Comment;
use App\Models\Penalty;
use App\Models\User;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->user = User::factory()->create();
});

test('suspende a conta, retira pendente da fila e esconde perfil e artigos publicamente', function () {
    $article = Article::factory()->for($this->user, 'author')->published()->create();
    $comment = Comment::factory()->for($article)->create(['user_id' => $this->user->id]);

    app(SuspendUser::class)->handle(
        $this->user,
        $this->admin,
        7,
        '2.1',
        'Conteúdo usado para propaganda.',
    );

    $penalty = Penalty::query()->where('user_id', $this->user->id)->sole();

    expect($this->user->fresh()->isSuspended())->toBeTrue()
        ->and($penalty->type)->toBe(PenaltyType::Suspension)
        ->and($penalty->appeal_deadline_at)->not->toBeNull();

    $this->get(route('articles.show', $article->slug))->assertInertia(fn (Assert $page) => $page
        ->component('errors/not-found'));
    $this->get(route('profiles.show', $this->user->username))->assertNotFound();
});

test('fim da suspensão reativa automaticamente e volta o conteudo publico', function () {
    $article = Article::factory()->for($this->user, 'author')->published()->create();
    app(SuspendUser::class)->handle($this->user, $this->admin, 7, '2.1', 'Violação da Política.');

    $this->user->forceFill(['suspended_until' => now()->subMinute()])->save();

    expect(app(EndExpiredSuspensions::class)->handle())->toBe(1)
        ->and($this->user->fresh()->isSuspended())->toBeFalse();

    $this->get(route('articles.show', $article->slug))->assertOk();
});

test('o link assinado cria uma unica contestacao e aceita reativa suspensao', function () {
    app(SuspendUser::class)->handle($this->user, $this->admin, 7, '2.1', 'Violação da Política.');
    $penalty = Penalty::query()->sole();
    $url = URL::temporarySignedRoute('penalty.appeal.submit', now()->addDay(), ['penalty' => $penalty->id]);

    $this->post($url, ['justification' => 'A decisão foi baseada em um contexto que não foi considerado.'])
        ->assertRedirect();
    $appeal = Appeal::query()->sole();

    expect($appeal->status)->toBe(AppealStatus::Open);

    app(DecideAppeal::class)->handle(
        $appeal,
        $this->admin,
        true,
        'Depois da análise, a suspensão foi considerada indevida.',
    );

    expect($appeal->fresh()->status)->toBe(AppealStatus::Accepted)
        ->and($this->user->fresh()->isSuspended())->toBeFalse();
});

test('banimento exclui artigos comentarios curtidas e favoritos mas retém a conta', function () {
    $article = Article::factory()->for($this->user, 'author')->published()->create();
    $comment = Comment::factory()->for($article)->create(['user_id' => $this->user->id]);

    app(BanUser::class)->handle(
        $this->user,
        $this->admin,
        '3.2',
        'Uso repetido de conteúdo proibido.',
    );

    expect($this->user->fresh()->isBanned())->toBeTrue()
        ->and(Article::query()->where('user_id', $this->user->id)->count())->toBe(0)
        ->and(Comment::query()->where('user_id', $this->user->id)->count())->toBe(0);

    $this->get(route('profiles.show', $this->user->username))->assertNotFound();
});
