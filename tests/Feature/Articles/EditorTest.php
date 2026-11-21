<?php

use App\Domain\Articles\Enums\ArticleState;
use App\Domain\Articles\Enums\VersionStatus;
use App\Models\Article;
use App\Models\ArticleVersion;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/*
 * Escrever e editar com salvamento automático (p4-04, RF-071, D80).
 */

function doc(string $text = 'Texto do artigo.'): array
{
    return ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => $text]]]]];
}

test('só conta confirmada escreve', function () {
    $this->get(route('articles.create'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->unverified()->create())
        ->get(route('articles.create'))
        ->assertRedirect(route('verification.notice'));
});

test('o editor novo vem vazio, no idioma da interface e com as categorias', function () {
    $this->actingAs(User::factory()->create())
        ->withHeader('Accept-Language', 'en')
        ->get(route('articles.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('articles/edit')
            ->where('articleId', null)
            ->where('draft.language', 'en')
            ->has('categories', 10)
            ->where('limits.title', 150)
            ->where('limits.characters', 50000),
        );

    expect(Article::query()->count())->toBe(0);
});

test('o primeiro salvamento cria o artigo e o rascunho', function () {
    $user = User::factory()->create();
    $category = Category::query()->first();

    $response = $this->actingAs($user)->withHeader('Accept-Language', 'pt-BR')->postJson(route('articles.store'), [
        'title' => '  Filas no Laravel  ',
        'content' => doc(),
        'category_id' => $category->id,
        'tags' => ['Laravel', 'laravel', 'Filas PHP'],
    ])->assertCreated();

    $article = Article::query()->sole();
    $draft = $article->versions()->sole();

    expect($response->json('editUrl'))->toBe(route('articles.edit', $article, absolute: false))
        ->and($article->user_id)->toBe($user->id)
        ->and($article->state)->toBe(ArticleState::Unpublished)
        ->and($draft->status)->toBe(VersionStatus::Draft)
        ->and($draft->title)->toBe('Filas no Laravel')
        ->and($draft->language)->toBe('pt_BR')
        ->and($draft->content_text)->toBe('Texto do artigo.')
        ->and($draft->tags()->orderBy('name')->pluck('name')->all())->toBe(['filas-php', 'laravel']);
});

test('salvamentos seguintes mudam só o que veio e limpam o conteúdo', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->create();
    $draft = ArticleVersion::factory()->for($article)->create(['title' => 'Antes']);

    $this->actingAs($user)->putJson(route('articles.draft.update', $article), [
        'content' => ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [
            ['type' => 'text', 'text' => 'eu achava que '],
            ['type' => 'text', 'text' => 'isso', 'marks' => [['type' => 'bold'], ['type' => 'underline']]],
            ['type' => 'text', 'text' => ' link', 'marks' => [['type' => 'link', 'attrs' => ['href' => 'javascript:alert(1)']]]],
        ]], ['type' => 'image', 'attrs' => ['src' => 'x']]]],
    ])->assertOk()->assertJsonStructure(['savedAt']);

    $draft->refresh();

    expect($draft->title)->toBe('Antes')
        ->and($draft->content['content'])->toBe([['type' => 'paragraph', 'content' => [
            ['type' => 'text', 'text' => 'eu achava que '],
            ['type' => 'text', 'text' => 'isso', 'marks' => [['type' => 'bold']]],
            ['type' => 'text', 'text' => ' link'],
        ]]])
        ->and($article->versions()->count())->toBe(1);
});

test('limites de título, conteúdo, idioma e tags', function (array $data, string $field) {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->create();
    ArticleVersion::factory()->for($article)->create();

    $this->actingAs($user)
        ->putJson(route('articles.draft.update', $article), $data)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'título longo' => [['title' => str_repeat('a', 151)], 'title'],
    'conteúdo longo' => [['content' => doc(str_repeat('a', 50_001))], 'content'],
    'idioma fora da lista' => [['language' => 'es'], 'language'],
    'categoria inexistente' => [['category_id' => 999_999], 'category_id'],
    'tags demais' => [['tags' => range(1, 11)], 'tags'],
]);

test('tag bloqueada é recusada com o nome dela', function () {
    Tag::factory()->blocked()->create(['name' => 'ganhe-dinheiro']);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson(route('articles.store'), ['tags' => ['Ganhe Dinheiro']])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['tags' => 'ganhe-dinheiro']);

    expect(Article::query()->count())->toBe(0);
});

test('só quem escreveu edita, salva ou vê a prévia', function () {
    $article = Article::factory()->create();
    ArticleVersion::factory()->for($article)->create();
    $other = User::factory()->create();

    $this->actingAs($other)->get(route('articles.edit', $article))->assertForbidden();
    $this->actingAs($other)->putJson(route('articles.draft.update', $article), ['title' => 'x'])->assertForbidden();
    $this->actingAs($other)->get(route('articles.preview', $article))->assertForbidden();
});

test('artigo na lixeira não é editado', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->create();
    $article->delete();

    $this->actingAs($user)->get(route('articles.edit', $article))->assertNotFound();
});

test('editar um artigo publicado abre um rascunho copiado da versão em vigor', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->published()->create();
    $current = $article->currentVersion;
    $current->tags()->attach(Tag::factory()->create(['name' => 'php']));

    $this->actingAs($user)
        ->get(route('articles.edit', $article))
        ->assertInertia(fn (Assert $page) => $page
            ->where('published', true)
            ->where('draft.title', $current->title)
            ->where('draft.tags', ['php']),
        );

    $draft = $article->versions()->where('status', VersionStatus::Draft)->sole();

    expect($draft->based_on_id)->toBe($current->id)
        ->and($draft->category_id)->toBe($current->category_id)
        ->and($article->fresh()->current_version_id)->toBe($current->id);

    // Abrir de novo usa o mesmo rascunho.
    $this->actingAs($user)->get(route('articles.edit', $article));
    expect($article->versions()->where('status', VersionStatus::Draft)->count())->toBe(1);
});

test('com uma versão pendente, o rascunho parte dela (RF-103)', function () {
    $user = User::factory()->create();
    $article = Article::factory()->for($user, 'author')->create();
    $pending = ArticleVersion::factory()->for($article)->create(['status' => VersionStatus::Pending, 'title' => 'Enviada']);

    $this->actingAs($user)->get(route('articles.edit', $article));

    $draft = $article->versions()->where('status', VersionStatus::Draft)->sole();

    expect($draft->title)->toBe('Enviada')
        ->and($draft->based_on_id)->toBe($pending->id)
        ->and($pending->fresh()->status)->toBe(VersionStatus::Pending);
});

test('a prévia mostra o rascunho como vai ao ar', function () {
    $user = User::factory()->create(['name' => 'Rafa Moreira', 'bio' => 'Dev back-end.']);
    $article = Article::factory()->for($user, 'author')->create();
    ArticleVersion::factory()->for($article)->create([
        'title' => 'Filas',
        'content' => ['type' => 'doc', 'content' => [
            ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [['type' => 'text', 'text' => 'Quem tira o job']]],
            ['type' => 'codeBlock', 'attrs' => ['language' => 'php'], 'content' => [['type' => 'text', 'text' => 'echo 1;']]],
        ]],
    ]);

    $this->actingAs($user)
        ->get(route('articles.preview', $article))
        ->assertInertia(fn (Assert $page) => $page
            ->component('articles/preview')
            ->where('article.title', 'Filas')
            ->where('article.toc', [['id' => 'quem-tira-o-job', 'text' => 'Quem tira o job', 'level' => 2]])
            ->where('article.html', fn (string $html) => str_contains($html, 'hl-keyword') && str_contains($html, 'id="quem-tira-o-job"'))
            ->where('article.readingMinutes', 1)
            ->where('article.author.name', 'Rafa Moreira')
            ->missing('article.author.email'),
        );
});
