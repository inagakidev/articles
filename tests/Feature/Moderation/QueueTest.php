<?php

use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Fila de aprovação e painel (RF-249, RF-262, RF-378, D87).
 */

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

function queued(string $title, int $hoursAgo, ?Article $article = null): ArticleVersion
{
    return ArticleVersion::factory()->for($article ?? Article::factory()->create())->create([
        'status' => VersionStatus::Pending,
        'submitted_at' => now()->subHours($hoursAgo),
        'title' => $title,
    ]);
}

test('mostra as pendentes, as mais antigas primeiro, com o tipo e o atraso', function () {
    $edit = queued('Edição', 7, Article::factory()->published()->create());
    $new = queued('Novo', 1);
    ArticleVersion::factory()->create(['status' => VersionStatus::Draft]);

    $this->actingAs($this->admin)->get(route('admin.queue'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/queue')
            ->where('versions.total', 2)
            ->where('versions.data.0.id', $edit->id)
            ->where('versions.data.0.type', 'edit')
            ->where('versions.data.0.late', true)
            ->where('versions.data.1.id', $new->id)
            ->where('versions.data.1.type', 'new')
            ->where('versions.data.1.late', false),
        );
});

test('artigo na lixeira não aparece na fila', function () {
    queued('Na lixeira', 2)->article->delete();

    $this->actingAs($this->admin)->get(route('admin.queue'))
        ->assertInertia(fn (Assert $page) => $page->where('versions.total', 0));
});

test('filtra por tipo e busca por título ou autor', function () {
    queued('Filas no Laravel', 2, Article::factory()->for(User::factory()->create(['username' => 'rafa']), 'author')->create());
    queued('Tipos do TypeScript', 1, Article::factory()->published()->create());

    $this->actingAs($this->admin)->get(route('admin.queue', ['tipo' => 'edit']))
        ->assertInertia(fn (Assert $page) => $page->where('versions.total', 1)->where('versions.data.0.title', 'Tipos do TypeScript'));
    $this->actingAs($this->admin)->get(route('admin.queue', ['q' => 'rafa']))
        ->assertInertia(fn (Assert $page) => $page->where('versions.total', 1)->where('versions.data.0.title', 'Filas no Laravel'));
});

test('o painel conta publicados e a fila, e avisa das atrasadas', function () {
    Article::factory()->published()->count(2)->create();
    $late = queued('Atrasada', 8);
    queued('Recente', 1);

    $this->actingAs($this->admin)->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('metrics.published', 2)
            ->where('metrics.pending', 2)
            ->has('attention', 1)
            ->where('attention.0.id', $late->id)
            ->where('attention.0.hours', 8)
            ->where('adminCounts.queue', 2),
        );
});

test('quem não administra não vê a fila nem recebe a contagem', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('admin.queue'))->assertForbidden();
    $this->actingAs($user)->get(route('articles.index'))
        ->assertInertia(fn (Assert $page) => $page->where('adminCounts', null));
});
